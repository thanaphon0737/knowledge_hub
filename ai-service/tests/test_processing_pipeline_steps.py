import pytest
import json
from unittest.mock import MagicMock, AsyncMock
from langchain_core.documents import Document

# IMPORTANTE: Replace 'app.core.pipeline' with the actual path to your file
from app.core.pipeline import ProcessingPipeline

@pytest.mark.asyncio
class TestProcessingPipelineSteps:
    """
    ชุดการทดสอบสำหรับ ProcessingPipeline ที่แก้ไขให้ถูกต้องตามโค้ดจริง
    """

    # --- Step 1: ทดสอบว่า load_from_source ถูกเรียกใช้ถูกต้อง ---
    async def test_step1_calls_load_from_source(self, mocker):
        # ARRANGE
        # Mock load_from_source ให้เป็น synchronous mock ปกติ
        mock_loader = mocker.patch('app.core.pipeline.load_from_source')
        
        pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())

        # ACT
        # execute เป็น async แต่ฟังก์ชันข้างในส่วนใหญ่เป็น sync
        await pipeline.execute("f", "u", "d", "upload", "/path", None)

        # ASSERT: ตรวจสอบด้วย assert_called_once_with (ไม่ใช่ await)
        mock_loader.assert_called_once_with("upload", "/path")

    # --- Step 2: ทดสอบว่า split_documents ถูกเรียกใช้ถูกต้อง ---
    async def test_step2_calls_split_documents(self, mocker):
        # ARRANGE
        fake_docs = [Document(page_content="full document")]
        mocker.patch('app.core.pipeline.load_from_source', return_value=fake_docs)
        
        mock_splitter = MagicMock()
        mock_vector_store = MagicMock()
        
        pipeline = ProcessingPipeline(mock_splitter, MagicMock(), mock_vector_store)

        # ACT
        await pipeline.execute("f", "u", "d", "s", "l", None)

        # ASSERT: ตรวจสอบ synchronous mock
        mock_splitter.split_documents.assert_called_once_with(fake_docs)

    # --- Step 3: ทดสอบ Logic ของ _prepare_documents_for_store (เหมือนเดิม) ---
    def test_step3_prepare_documents_logic(self):
        # ARRANGE
        pipeline = ProcessingPipeline(MagicMock(), MagicMock(), MagicMock())
        chunks = [Document(page_content="chunk 1", metadata={})]

        # ACT
        prepared_docs, doc_ids = pipeline._prepare_documents_for_store(chunks, "file1", "user1", "doc1")

        # ASSERT
        assert doc_ids == ["file1_chunk_0"]
        assert prepared_docs[0].metadata['file_id'] == "file1"

    # --- Step 4: ทดสอบว่า upsert_documents ถูกเรียกใช้ถูกต้อง ---
    async def test_step4_calls_upsert_documents(self, mocker):
        # ARRANGE
        mocker.patch('app.core.pipeline.load_from_source')
        mock_splitter = MagicMock()
        mock_vector_store = MagicMock()
        
        pipeline = ProcessingPipeline(mock_splitter, MagicMock(), mock_vector_store)
        
        # Mock helper function เพื่อความง่าย
        mocker.patch.object(pipeline, '_prepare_documents_for_store', return_value=([], []))

        # ACT
        await pipeline.execute("f", "u", "d", "s", "l", None)

        # ASSERT
        mock_vector_store.upsert_documents.assert_called_once()

    # --- Step 5: ทดสอบว่า Webhook ถูกยิงไปเมื่อทำงานสำเร็จ ---
    async def test_step5_sends_webhook_on_success(self, mocker, httpx_mock):
        # ARRANGE: Mock synchronous functions
        mocker.patch('app.core.pipeline.load_from_source')
        mock_splitter = MagicMock()
        mock_vector_store = MagicMock()

        # ตั้งค่า httpx_mock สำหรับ async call
        webhook_url = "http://fake-webhook.com/notify"
        httpx_mock.add_response(method="PATCH", url=webhook_url)
        
        pipeline = ProcessingPipeline(mock_splitter, MagicMock(), mock_vector_store)
        # Mock helper function
        mocker.patch.object(pipeline, '_prepare_documents_for_store', return_value=([], []))

        # ACT
        await pipeline.execute("file-final", "u", "d", "s", "l", webhook_url)

        # ASSERT: ตรวจสอบการยิง request
        requests = httpx_mock.get_requests()
        assert len(requests) == 1
        payload = json.loads(requests[0].content)
        assert payload["status"] == "READY"
        assert payload["fileId"] == "file-final"