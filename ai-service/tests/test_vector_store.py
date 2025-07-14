import pytest
from langchain_core.documents import Document
from unittest.mock import MagicMock

# Replace with the actual path to your VectorStoreService class
from app.core.vector_store import VectorStoreService

# This fixture creates a mocked Chroma instance and a service that uses it.
# This setup is reused across multiple tests to avoid duplicate code.
@pytest.fixture
def mocked_service(mocker):
    """Mocks the Chroma class and returns an instance of VectorStoreService."""
    # Mock the entire Chroma class
    mock_chroma_class = mocker.patch('app.core.vector_store.Chroma')
    
    # Create a fake embedding function, as the constructor requires it
    fake_embedding_function = MagicMock()
    
    # Instantiate your service. Its self._vector_store will be a mock.
    service = VectorStoreService(embedding_function=fake_embedding_function, persist_directory="./fake_db")
    
    # The instance of the mocked class is available via .return_value
    service._vector_store = mock_chroma_class.return_value
    return service

## Test Cases ##

def test_initialization(mocker):
    """Tests that the Chroma database is initialized with the correct parameters."""
    # ARRANGE
    mock_chroma_class = mocker.patch('app.core.vector_store.Chroma')
    fake_embedding_function = MagicMock()

    # ACT
    VectorStoreService(
        embedding_function=fake_embedding_function,
        persist_directory='./test_db',
        collection_name='test_collection'
    )

    # ASSERT
    mock_chroma_class.assert_called_once_with(
        collection_name='test_collection',
        embedding_function=fake_embedding_function,
        persist_directory='./test_db'
    )

def test_upsert_documents(mocked_service):
    """Tests that the add_documents method is called correctly."""
    # ARRANGE
    docs = [Document(page_content="doc1"), Document(page_content="doc2")]
    ids = ["id1", "id2"]

    # ACT
    mocked_service.upsert_documents(documents=docs, ids=ids)

    # ASSERT
    mocked_service._vector_store.add_documents.assert_called_once_with(documents=docs, ids=ids)

def test_upsert_documents_mismatched_lengths(mocked_service):
    """Tests that a ValueError is raised for mismatched document and ID lengths."""
    # ARRANGE
    docs = [Document(page_content="doc1")]
    ids = ["id1", "id2"] # Length mismatch

    # ACT & ASSERT
    with pytest.raises(ValueError, match="The number of documents must match the number of IDs."):
        mocked_service.upsert_documents(documents=docs, ids=ids)
    
    mocked_service._vector_store.add_documents.assert_not_called()

def test_similarity_search(mocked_service):
    """Tests that the similarity_search method is called correctly."""
    # ARRANGE
    fake_results = [Document(page_content="search result")]
    mocked_service._vector_store.similarity_search.return_value = fake_results
    
    # ACT
    results = mocked_service.similarity_search("my query", k=5)

    # ASSERT
    mocked_service._vector_store.similarity_search.assert_called_once_with("my query", k=5)
    assert results == fake_results

def test_get_retriever(mocked_service):
    """Tests that the as_retriever method is called correctly."""
    # ARRANGE
    search_kwargs = {"k": 3}
    
    # ACT
    mocked_service.get_retriever(search_kwargs=search_kwargs)

    # ASSERT
    mocked_service._vector_store.as_retriever.assert_called_once_with(search_kwargs=search_kwargs)
    
def test_peek_collection(mocked_service):
    """Tests the logic of formatting the data from the vector store's get method."""
    # ARRANGE
    # This is a fake response from Chroma's .get() method
    fake_db_data = {
        "ids": ["id1", "id2"],
        "documents": ["content1", "content2"],
        "metadatas": [{"meta": "data1"}, {"meta": "data2"}]
    }
    mocked_service._vector_store.get.return_value = fake_db_data
    
    expected_output = [
        {"id": "id1", "page_content": "content1", "metadata": {"meta": "data1"}},
        {"id": "id2", "page_content": "content2", "metadata": {"meta": "data2"}},
    ]

    # ACT
    result = mocked_service.peek_collection(limit=2)

    # ASSERT
    mocked_service._vector_store.get.assert_called_once_with(limit=2)
    assert result == expected_output

def test_peek_empty_collection(mocked_service):
    """Tests peeking into an empty collection."""
    # ARRANGE
    mocked_service._vector_store.get.return_value = {"ids": []} # Empty response

    # ACT
    result = mocked_service.peek_collection(limit=5)
    
    # ASSERT
    assert result == []