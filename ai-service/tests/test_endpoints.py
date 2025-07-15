import pytest
import httpx
from unittest.mock import AsyncMock, MagicMock

# Import the app AND the lifespan function from your main file
from app.main import app, lifespan

@pytest.mark.asyncio
class TestApiEndpoints:

    async def test_health_check(self):
        """Tests the health check endpoint."""
        # For simple tests without state, this is enough.
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    async def test_process_document_success(self, mocker):
        """Tests the /process endpoint successfully without fixtures."""
        # ARRANGE
        # 1. Mock all dependencies BEFORE the app starts
        mocker.patch('app.main.load_dotenv')
        mocker.patch('app.main.os.getenv', return_value='fake_api_key')
        mocker.patch('app.main.EmbeddingService')
        mocker.patch('app.main.TextSplitterService')
        mocker.patch('app.main.VectorStoreService')
        mocker.patch('app.main.ProcessingPipeline') # Mocks the class
        mocker.patch('app.main.RagPipeline')
        mocker.patch('app.main.ChatGoogleGenerativeAI')

        # 2. Manually run the app's startup logic. This populates app.state.
        async with lifespan(app):
            # By this point, app.state is guaranteed to be populated with MOCKS.
            
            # 3. Configure the method on the mock that now lives in app.state
            app.state.processing_pipeline.execute = AsyncMock()

            # 4. Create the client to make the API call
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                
                # ACT
                payload = {"file_id": "f1", "user_id": "u1", "document_id": "d1", "source_type": "s", "source_location": "l"}
                response = await client.post("/api/v1/process", json=payload)

                # ASSERT
                assert response.status_code == 202
                app.state.processing_pipeline.execute.assert_awaited_once()

    async def test_query_document_success(self, mocker):
        """Tests the /query endpoint successfully without fixtures."""
        # ARRANGE
        # 1. Mock all dependencies BEFORE the app starts
        mocker.patch('app.main.load_dotenv')
        mocker.patch('app.main.os.getenv', return_value='fake_api_key')
        mocker.patch('app.main.EmbeddingService')
        mocker.patch('app.main.TextSplitterService')
        mocker.patch('app.main.VectorStoreService')
        mocker.patch('app.main.ProcessingPipeline')
        mocker.patch('app.main.RagPipeline')
        mocker.patch('app.main.ChatGoogleGenerativeAI')

        # 2. Manually run the app's startup logic
        async with lifespan(app):
            
            # 3. Configure the method on the mock in app.state
            app.state.rag_pipeline.get_answer = AsyncMock(return_value={"answer": "Test answer", "sources": []})
            
            # 4. Create the client
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                
                # ACT
                payload = {"user_id": "u1", "document_id": "d1", "question": "Test?"}
                response = await client.post("/api/v1/query", json=payload)

                # ASSERT
                assert response.status_code == 200
                assert response.json()["answer"] == "Test answer"
                app.state.rag_pipeline.get_answer.assert_awaited_once()
    # เพิ่มฟังก์ชันเหล่านี้เข้าไปใน class TestApiEndpoints ของคุณ

    async def test_process_document_internal_error(self, mocker):
        """
        ทดสอบ /process endpoint: กรณีที่ pipeline ภายในเกิด exception
        """
        # ARRANGE
        # 1. Mock dependencies และรัน lifespan ให้ app.state พร้อมใช้งาน
        mocker.patch('app.main.load_dotenv')
        mocker.patch('app.main.os.getenv', return_value='fake_api_key')
        mocker.patch('app.main.ProcessingPipeline')
        mocker.patch('app.main.ChatGoogleGenerativeAI')
        # ... (สามารถ mock service อื่นๆ เพิ่มเติมได้ถ้าจำเป็น)

        async with lifespan(app):
            # 2. ตั้งค่าให้เมธอด execute ของ mock ที่อยู่ใน app.state เกิด Error
            error_message = "Database connection failed"
            app.state.processing_pipeline.execute = AsyncMock(side_effect=RuntimeError(error_message))
            
            # 3. เตรียม client และ payload ที่ถูกต้อง
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                payload = {"file_id": "f1", "user_id": "u1", "document_id": "d1", "source_type": "s", "source_location": "l"}

                # ACT
                response = await client.post("/api/v1/process", json=payload)

                # ASSERT
                assert response.status_code == 500
                response_data = response.json()
                assert "detail" in response_data
                assert response_data["detail"] == f"Error processing document: {error_message}"


    async def test_query_document_internal_error(self, mocker):
        """
        ทดสอบ /query endpoint: กรณีที่ RAG pipeline เกิด exception
        """
        # ARRANGE
        # 1. Mock dependencies และรัน lifespan
        mocker.patch('app.main.load_dotenv')
        mocker.patch('app.main.os.getenv', return_value='fake_api_key')
        mocker.patch('app.main.RagPipeline')
        mocker.patch('app.main.ChatGoogleGenerativeAI')
        # ...

        async with lifespan(app):
            # 2. ตั้งค่าให้เมธอด get_answer ของ mock ที่อยู่ใน app.state เกิด Error
            error_message = "LLM service unavailable"
            app.state.rag_pipeline.get_answer = AsyncMock(side_effect=ValueError(error_message))
            
            # 3. เตรียม client และ payload
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
                payload = {"user_id": "u1", "document_id": "d1", "question": "Test?"}

                # ACT
                response = await client.post("/api/v1/query", json=payload)

                # ASSERT
                assert response.status_code == 500
                response_data = response.json()
                assert "detail" in response_data
                assert response_data["detail"] == f"Error querying document: {error_message}"