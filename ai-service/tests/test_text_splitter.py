import pytest
from langchain_core.documents import Document

# Replace with the actual path to your TextSplitterService class
from app.core.text_splitter import TextSplitterService

## Test Cases ##

def test_initialization_with_default_values(mocker):
    """
    Tests that the service initializes RecursiveCharacterTextSplitter 
    with default values.
    """
    # ARRANGE: Mock the text splitter class
    mock_splitter_class = mocker.patch(
        'app.core.text_splitter.RecursiveCharacterTextSplitter'
    )

    # ACT: Create an instance of our service
    TextSplitterService()

    # ASSERT: Check that the underlying class was called with the correct defaults
    mock_splitter_class.assert_called_once_with(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

def test_initialization_with_custom_values(mocker):
    """
    Tests that the service initializes RecursiveCharacterTextSplitter 
    with custom values.
    """
    # ARRANGE
    mock_splitter_class = mocker.patch(
        'app.core.text_splitter.RecursiveCharacterTextSplitter'
    )

    # ACT
    TextSplitterService(chunk_size=500, chunk_overlap=50)

    # ASSERT
    mock_splitter_class.assert_called_once_with(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

def test_split_documents(mocker):
    """
    Tests that the split_documents method correctly calls the underlying splitter.
    """
    # ARRANGE
    # Create some fake documents to be split
    input_docs = [
        Document(page_content="This is the first long document."),
        Document(page_content="This is the second long document.")
    ]
    
    # Define what the mocked splitter should return
    fake_chunks = [
        Document(page_content="This is the first"),
        Document(page_content="long document.")
    ]
    
    # Mock the text splitter class and configure its instance's method
    mock_splitter_class = mocker.patch(
        'app.core.text_splitter.RecursiveCharacterTextSplitter'
    )
    mock_splitter_instance = mock_splitter_class.return_value
    mock_splitter_instance.split_documents.return_value = fake_chunks
    
    service = TextSplitterService()

    # ACT
    result_chunks = service.split_documents(input_docs)

    # ASSERT
    # Check that the splitter's method was called with our input documents
    mock_splitter_instance.split_documents.assert_called_once_with(input_docs)
    
    # Check that our function returned the fake chunks from the mock
    assert result_chunks == fake_chunks

def test_split_documents_with_empty_list(mocker):
    """
    Tests that the method returns an empty list if no documents are provided,
    without calling the splitter.
    """
    # ARRANGE
    service = TextSplitterService()
    # We can spy on the real object's method to see if it was called
    service.text_splitter.split_documents = mocker.Mock()

    # ACT
    result = service.split_documents([])

    # ASSERT
    assert result == []
    service.text_splitter.split_documents.assert_not_called()