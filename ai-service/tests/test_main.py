import pytest
import httpx
from unittest.mock import MagicMock

# Import the app AND the lifespan function from your main file
from app.main import app, lifespan

@pytest.mark.asyncio
class TestMainAppAndLifespan:

    # --- Test for a simple endpoint (still useful) ---
    async def test_read_root(self):
        """Tests the root endpoint is accessible."""
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            # We add a dummy startup event to the client to avoid the real lifespan
            # since we are testing it separately now.
            await client.post("/startup") # This is a convention for some test setups
            response = await client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Welcome to My FastAPI Application!"}

    # --- Direct tests for the lifespan function ---
    async def test_lifespan_startup_success(self, mocker):
        """
        Tests that all services are initialized correctly during startup
        by directly invoking the lifespan context manager.
        """
        # ARRANGE: Mock all dependencies that are called within the lifespan
        mocker.patch('app.main.load_dotenv')
        mocker.patch('app.main.os.getenv', return_value='fake_api_key')
        mock_embedding = mocker.patch('app.main.EmbeddingService')
        mock_splitter = mocker.patch('app.main.TextSplitterService')
        mock_vector_store = mocker.patch('app.main.VectorStoreService')
        mock_proc_pipeline = mocker.patch('app.main.ProcessingPipeline')
        mock_rag_pipeline = mocker.patch('app.main.RagPipeline')
        mocker.patch('app.main.ChatGoogleGenerativeAI')

        # Create a fake app object to pass to the lifespan function
        mock_app = MagicMock()

        # ACT: Manually enter the lifespan's context. This runs the startup code.
        async with lifespan(mock_app):
            # ASSERT: The code inside 'async with' runs after the 'yield' in lifespan.
            # By this point, all services should have been initialized.
            mock_embedding.assert_called_once()
            mock_splitter.assert_called_once()
            mock_vector_store.assert_called_once()
            mock_proc_pipeline.assert_called_once()
            mock_rag_pipeline.assert_called_once()

            # Check that the state was set correctly on our fake app
            assert hasattr(mock_app.state, 'processing_pipeline')
            assert mock_app.state.rag_pipeline == mock_rag_pipeline.return_value

    async def test_lifespan_startup_failure(self, mocker):
        """
        Tests that an exception during service initialization is raised correctly.
        """
        # ARRANGE: Mock a service to fail during initialization
        mocker.patch('app.main.load_dotenv')
        mocker.patch('app.main.os.getenv', return_value='fake_api_key')
        mocker.patch('app.main.EmbeddingService', side_effect=ValueError("Connection to service failed"))

        mock_app = MagicMock()

        # ACT & ASSERT: The exception will be raised when we try to enter the context.
        with pytest.raises(ValueError, match="Connection to service failed"):
            async with lifespan(mock_app):
                # This code block will not be reached
                pass