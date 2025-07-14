import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from typing import List
from langchain_core.documents import Document

from app.core.pipeline import ProcessingPipeline
from app.core.text_splitter import TextSplitterService
from app.core.embedding_service import EmbeddingService
from app.core.vector_store import VectorStoreService


@pytest.fixture
def mock_text_splitter():
    """Mock TextSplitterService"""
    mock = Mock(spec=TextSplitterService)
    mock.split_documents = AsyncMock()
    return mock


@pytest.fixture
def mock_embedding_service():
    """Mock EmbeddingService"""
    mock = Mock(spec=EmbeddingService)
    return mock


@pytest.fixture
def mock_vector_store_service():
    """Mock VectorStoreService"""
    mock = Mock(spec=VectorStoreService)
    mock.upsert_documents = AsyncMock()
    return mock


@pytest.fixture
def processing_pipeline(mock_text_splitter, mock_embedding_service, mock_vector_store_service):
    """Create ProcessingPipeline instance with mocked dependencies"""
    return ProcessingPipeline(
        text_splitter=mock_text_splitter,
        embedding_service=mock_embedding_service,
        vector_store_service=mock_vector_store_service
    )


@pytest.fixture
def sample_documents():
    """Sample documents for testing"""
    return [
        Document(
            page_content="This is the first chunk of text",
            metadata={"source": "test.txt", "page": 1}
        ),
        Document(
            page_content="This is the second chunk of text",
            metadata={"source": "test.txt", "page": 2}
        ),
        Document(
            page_content="This is the third chunk of text",
            metadata={"source": "test.txt", "page": 3}
        )
    ]


@pytest.fixture
def sample_chunks():
    """Sample chunks after text splitting"""
    return [
        Document(
            page_content="First chunk content",
            metadata={"source": "test.txt"}
        ),
        Document(
            page_content="Second chunk content",
            metadata={"source": "test.txt"}
        )
    ]


class TestProcessingPipeline:
    """Test suite for ProcessingPipeline class"""

    def test_init(self, mock_text_splitter, mock_embedding_service, mock_vector_store_service):
        """Test ProcessingPipeline initialization"""
        pipeline = ProcessingPipeline(
            text_splitter=mock_text_splitter,
            embedding_service=mock_embedding_service,
            vector_store_service=mock_vector_store_service
        )
        
        assert pipeline.text_splitter == mock_text_splitter
        assert pipeline.embedding_service == mock_embedding_service
        assert pipeline.vector_store_service == mock_vector_store_service

    def test_prepare_documents_for_store(self, processing_pipeline, sample_chunks):
        """Test _prepare_documents_for_store method"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        
        prepared_docs, doc_ids = processing_pipeline._prepare_documents_for_store(
            chunks=sample_chunks,
            file_id=file_id,
            user_id=user_id,
            document_id=document_id
        )
        
        # Check that we get the same number of documents and IDs
        assert len(prepared_docs) == len(sample_chunks)
        assert len(doc_ids) == len(sample_chunks)
        
        # Check ID format
        expected_ids = [f"{file_id}_chunk_{i}" for i in range(len(sample_chunks))]
        assert doc_ids == expected_ids
        
        # Check metadata is properly set
        for i, doc in enumerate(prepared_docs):
            assert doc.metadata['file_id'] == file_id
            assert doc.metadata['user_id'] == user_id
            assert doc.metadata['document_id'] == document_id
            assert doc.metadata['chunk_number'] == i
            # Original metadata should be preserved
            assert doc.metadata['source'] == "test.txt"

    def test_prepare_documents_for_store_empty_chunks(self, processing_pipeline):
        """Test _prepare_documents_for_store with empty chunks list"""
        prepared_docs, doc_ids = processing_pipeline._prepare_documents_for_store(
            chunks=[],
            file_id="test_file",
            user_id="test_user",
            document_id="test_doc"
        )
        
        assert prepared_docs == []
        assert doc_ids == []

    @pytest.mark.asyncio
    async def test_execute_success(self, processing_pipeline, sample_documents, sample_chunks):
        """Test successful execution of the pipeline"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        source_type = "file"
        source_location = "/path/to/file.txt"
        webhook_url = None
        
        # Mock the dependencies
        with patch('app.core.processing_pipeline.load_from_source') as mock_load:
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.return_value = sample_chunks
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify all methods were called correctly
            mock_load.assert_called_once_with(source_type, source_location)
            processing_pipeline.text_splitter.split_documents.assert_called_once_with(sample_documents)
            processing_pipeline.vector_store_service.upsert_documents.assert_called_once()
            
            # Check the arguments passed to upsert_documents
            call_args = processing_pipeline.vector_store_service.upsert_documents.call_args
            assert 'documents' in call_args.kwargs
            assert 'ids' in call_args.kwargs
            assert len(call_args.kwargs['documents']) == len(sample_chunks)
            assert len(call_args.kwargs['ids']) == len(sample_chunks)

    @pytest.mark.asyncio
    async def test_execute_with_webhook_success(self, processing_pipeline, sample_documents, sample_chunks):
        """Test successful execution with webhook notification"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        source_type = "file"
        source_location = "/path/to/file.txt"
        webhook_url = "https://example.com/webhook"
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load, \
             patch('app.core.processing_pipeline.httpx.AsyncClient') as mock_client:
            
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.return_value = sample_chunks
            
            # Mock the HTTP client
            mock_client_instance = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify webhook was called with correct data
            mock_client_instance.patch.assert_called_once_with(
                webhook_url,
                json={
                    "fileId": file_id,
                    "status": "READY",
                    "errorMessage": None
                }
            )

    @pytest.mark.asyncio
    async def test_execute_load_from_source_failure(self, processing_pipeline):
        """Test pipeline execution when load_from_source fails"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        source_type = "file"
        source_location = "/path/to/file.txt"
        webhook_url = "https://example.com/webhook"
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load, \
             patch('app.core.processing_pipeline.httpx.AsyncClient') as mock_client:
            
            # Make load_from_source raise an exception
            mock_load.side_effect = Exception("Failed to load document")
            
            mock_client_instance = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify webhook was called with error status
            mock_client_instance.patch.assert_called_once_with(
                webhook_url,
                json={
                    "fileId": file_id,
                    "status": "ERROR",
                    "errorMessage": "Failed to load document"
                }
            )
            
            # Verify other methods were not called
            processing_pipeline.text_splitter.split_documents.assert_not_called()
            processing_pipeline.vector_store_service.upsert_documents.assert_not_called()

    @pytest.mark.asyncio
    async def test_execute_text_splitter_failure(self, processing_pipeline, sample_documents):
        """Test pipeline execution when text splitter fails"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        source_type = "file"
        source_location = "/path/to/file.txt"
        webhook_url = None
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load:
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.side_effect = Exception("Text splitting failed")
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify load_from_source was called
            mock_load.assert_called_once_with(source_type, source_location)
            
            # Verify text_splitter was called and failed
            processing_pipeline.text_splitter.split_documents.assert_called_once_with(sample_documents)
            
            # Verify vector_store_service was not called
            processing_pipeline.vector_store_service.upsert_documents.assert_not_called()

    @pytest.mark.asyncio
    async def test_execute_vector_store_failure(self, processing_pipeline, sample_documents, sample_chunks):
        """Test pipeline execution when vector store fails"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        source_type = "file"
        source_location = "/path/to/file.txt"
        webhook_url = "https://example.com/webhook"
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load, \
             patch('app.core.processing_pipeline.httpx.AsyncClient') as mock_client:
            
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.return_value = sample_chunks
            processing_pipeline.vector_store_service.upsert_documents.side_effect = Exception("Vector store failed")
            
            mock_client_instance = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify webhook was called with error status
            mock_client_instance.patch.assert_called_once_with(
                webhook_url,
                json={
                    "fileId": file_id,
                    "status": "ERROR",
                    "errorMessage": "Vector store failed"
                }
            )

    @pytest.mark.asyncio
    async def test_execute_webhook_callback_failure(self, processing_pipeline, sample_documents, sample_chunks):
        """Test pipeline execution when webhook callback fails"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        source_type = "file"
        source_location = "/path/to/file.txt"
        webhook_url = "https://example.com/webhook"
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load, \
             patch('app.core.processing_pipeline.httpx.AsyncClient') as mock_client:
            
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.return_value = sample_chunks
            
            # Mock the HTTP client to fail
            mock_client_instance = AsyncMock()
            mock_client_instance.patch.side_effect = Exception("HTTP request failed")
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            # This should not raise an exception, webhook failure should be caught
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify the main processing still completed
            processing_pipeline.vector_store_service.upsert_documents.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_no_webhook_url(self, processing_pipeline, sample_documents, sample_chunks):
        """Test pipeline execution without webhook URL"""
        file_id = "test_file_123"
        user_id = "user_456"
        document_id = "doc_789"
        source_type = "file"
        source_location = "/path/to/file.txt"
        webhook_url = None
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load, \
             patch('app.core.processing_pipeline.httpx.AsyncClient') as mock_client:
            
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.return_value = sample_chunks
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify HTTP client was not used
            mock_client.assert_not_called()
            
            # Verify main processing completed
            processing_pipeline.vector_store_service.upsert_documents.assert_called_once()


# Additional integration-style tests
class TestProcessingPipelineIntegration:
    """Integration tests for ProcessingPipeline"""

    @pytest.mark.asyncio
    async def test_end_to_end_processing(self, processing_pipeline, sample_documents, sample_chunks):
        """Test end-to-end processing workflow"""
        file_id = "integration_test_file"
        user_id = "integration_user"
        document_id = "integration_doc"
        source_type = "file"
        source_location = "/path/to/integration.txt"
        webhook_url = "https://integration.test/webhook"
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load, \
             patch('app.core.processing_pipeline.httpx.AsyncClient') as mock_client:
            
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.return_value = sample_chunks
            
            mock_client_instance = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=webhook_url
            )
            
            # Verify the complete workflow
            mock_load.assert_called_once_with(source_type, source_location)
            processing_pipeline.text_splitter.split_documents.assert_called_once_with(sample_documents)
            processing_pipeline.vector_store_service.upsert_documents.assert_called_once()
            
            # Check that documents were properly prepared
            upsert_call = processing_pipeline.vector_store_service.upsert_documents.call_args
            documents = upsert_call.kwargs['documents']
            ids = upsert_call.kwargs['ids']
            
            # Verify metadata was added correctly
            for i, doc in enumerate(documents):
                assert doc.metadata['file_id'] == file_id
                assert doc.metadata['user_id'] == user_id
                assert doc.metadata['document_id'] == document_id
                assert doc.metadata['chunk_number'] == i
                assert ids[i] == f"{file_id}_chunk_{i}"
            
            # Verify webhook notification
            mock_client_instance.patch.assert_called_once_with(
                webhook_url,
                json={
                    "fileId": file_id,
                    "status": "READY",
                    "errorMessage": None
                }
            )


# Parametrized tests for various scenarios
class TestProcessingPipelineParametrized:
    """Parametrized tests for different scenarios"""

    @pytest.mark.parametrize("file_id,user_id,document_id,source_type,source_location", [
        ("file_1", "user_1", "doc_1", "file", "/path/to/file1.txt"),
        ("file_2", "user_2", "doc_2", "url", "https://example.com/doc.pdf"),
        ("file_3", "user_3", "doc_3", "s3", "s3://bucket/file.docx"),
    ])
    @pytest.mark.asyncio
    async def test_execute_with_different_parameters(
        self, processing_pipeline, sample_documents, sample_chunks,
        file_id, user_id, document_id, source_type, source_location
    ):
        """Test execute method with different parameter combinations"""
        with patch('app.core.processing_pipeline.load_from_source') as mock_load:
            mock_load.return_value = sample_documents
            processing_pipeline.text_splitter.split_documents.return_value = sample_chunks
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type=source_type,
                source_location=source_location,
                webhook_url=None
            )
            
            # Verify correct parameters were passed
            mock_load.assert_called_once_with(source_type, source_location)
            
            # Verify documents were prepared with correct IDs
            upsert_call = processing_pipeline.vector_store_service.upsert_documents.call_args
            documents = upsert_call.kwargs['documents']
            ids = upsert_call.kwargs['ids']
            
            for i, doc in enumerate(documents):
                assert doc.metadata['file_id'] == file_id
                assert doc.metadata['user_id'] == user_id
                assert doc.metadata['document_id'] == document_id
                assert ids[i] == f"{file_id}_chunk_{i}"

    @pytest.mark.parametrize("exception_type,expected_status", [
        (ValueError("Invalid input"), "ERROR"),
        (FileNotFoundError("File not found"), "ERROR"),
        (ConnectionError("Network error"), "ERROR"),
        (RuntimeError("Runtime error"), "ERROR"),
    ])
    @pytest.mark.asyncio
    async def test_execute_with_different_exceptions(
        self, processing_pipeline, exception_type, expected_status
    ):
        """Test execute method handling different types of exceptions"""
        file_id = "test_file"
        user_id = "test_user"
        document_id = "test_doc"
        webhook_url = "https://test.com/webhook"
        
        with patch('app.core.processing_pipeline.load_from_source') as mock_load, \
             patch('app.core.processing_pipeline.httpx.AsyncClient') as mock_client:
            
            mock_load.side_effect = exception_type
            mock_client_instance = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            await processing_pipeline.execute(
                file_id=file_id,
                user_id=user_id,
                document_id=document_id,
                source_type="file",
                source_location="/path/to/file.txt",
                webhook_url=webhook_url
            )
            
            # Verify error status was sent
            mock_client_instance.patch.assert_called_once_with(
                webhook_url,
                json={
                    "fileId": file_id,
                    "status": expected_status,
                    "errorMessage": str(exception_type)
                }
            )


if __name__ == "__main__":
    pytest.main([__file__])