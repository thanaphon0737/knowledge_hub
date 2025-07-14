import pytest
import numpy as np

# Replace with the actual path to your EmbeddingService class
from app.core.embedding_service import EmbeddingService

# A reusable fixture to create a mocked service for our tests
@pytest.fixture
def mocked_embedding_service(mocker):
    """
    This fixture creates an instance of EmbeddingService but mocks the
    heavy SentenceTransformer model inside it.
    """
    # Mock the SentenceTransformer class at the source
    mock_model = mocker.patch('app.core.embedding_service.SentenceTransformer')
    
    # Create an instance of our service. The __init__ will use the mocked model.
    service = EmbeddingService()
    
    # The service now holds a reference to our mock model instance
    # We can now control the behavior of the mocked model for each test
    return service

## Test Cases ##

def test_initialization(mocker):
    """Tests that the service initializes the SentenceTransformer model correctly."""
    # ARRANGE: Mock the model
    mock_transformer_class = mocker.patch('app.core.embedding_service.SentenceTransformer')

    # ACT: Create an instance of the service
    EmbeddingService(model_name='BAAI/bge-m3')

    # ASSERT: Check that the model was initialized with the correct name
    mock_transformer_class.assert_called_once_with('BAAI/bge-m3')

def test_embed_documents(mocked_embedding_service):
    """Tests embedding a list of documents."""
    # ARRANGE
    service = mocked_embedding_service
    test_texts = ["hello world", "this is a test"]
    fake_embeddings = np.array([[0.1, 0.2], [0.3, 0.4]])
    
    # Configure the mock model's encode method to return our fake data
    service.model.encode.return_value = fake_embeddings

    # ACT
    result = service.embed_documents(test_texts)

    # ASSERT
    service.model.encode.assert_called_once_with(test_texts, normalize_embeddings=True)
    assert result == fake_embeddings.tolist()

def test_embed_documents_empty_list(mocked_embedding_service):
    """Tests that embedding an empty list returns an empty list."""
    service = mocked_embedding_service
    result = service.embed_documents([])
    
    # Assert that encode was NOT called and the result is an empty list
    service.model.encode.assert_not_called()
    assert result == []

def test_embed_query(mocked_embedding_service):
    """Tests embedding a single query."""
    # ARRANGE
    service = mocked_embedding_service
    test_query = "what is the meaning of life?"
    fake_embedding = np.array([0.5, 0.6, 0.7])
    service.model.encode.return_value = fake_embedding

    # ACT
    result = service.embed_query(test_query)

    # ASSERT
    service.model.encode.assert_called_once_with(test_query, normalize_embeddings=True)
    assert result == fake_embedding.tolist()

def test_embed_image_success(mocker, mocked_embedding_service):
    """Tests successful embedding of an image."""
    # ARRANGE
    service = mocked_embedding_service
    image_path = "dummy/image.jpg"
    
    # Mock Image.open to avoid file system access
    mock_image_open = mocker.patch('app.core.embedding_service.Image.open')
    # Create a fake image object that Image.open will return
    fake_image_object = "this is a fake PIL image"
    mock_image_open.return_value = fake_image_object

    # Configure the model to handle the fake image
    fake_embedding = np.array([0.8, 0.9, 1.0])
    service.model.encode.return_value = fake_embedding

    # ACT
    result = service.embed_image(image_path)

    # ASSERT
    mock_image_open.assert_called_once_with(image_path)
    service.model.encode.assert_called_once_with(fake_image_object, normalize_embeddings=True)
    assert result == fake_embedding.tolist()

def test_embed_image_file_not_found(mocker, mocked_embedding_service):
    """Tests that an exception from Image.open is re-raised."""
    # ARRANGE
    service = mocked_embedding_service
    image_path = "nonexistent/image.jpg"
    
    # Configure the mock to raise a FileNotFoundError
    mocker.patch(
        'app.core.embedding_service.Image.open', 
        side_effect=FileNotFoundError("File not found")
    )

    # ACT & ASSERT
    with pytest.raises(FileNotFoundError, match="File not found"):
        service.embed_image(image_path)