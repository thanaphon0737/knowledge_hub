import pytest
from langchain_core.documents import Document
from app.core.document_loader import load_from_source
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
# Add this inside tests/test_loader.py

def test_load_from_source_pdf_success(mocker):
    """
    Tests successful loading of a PDF file by mocking file system access 
    and the PDF loader.
    """
    # 1. ARRANGE: Set up our mocks
    # Mock os.path.exists to return True
    mocker.patch('os.path.exists', return_value=True)

    # Create a fake document to be returned by the loader
    fake_pdf_docs = [Document(page_content="This is a test PDF page.")]

    # Mock the entire PyPDFLoader class
    mock_loader = mocker.patch('app.core.document_loader.PyPDFLoader')
    # Make the mocked loader's .load() method return our fake document
    mock_loader.return_value.load.return_value = fake_pdf_docs

    # 2. ACT: Call the function
    documents = load_from_source(source_type='upload', source_location='dummy/path/to/report.pdf')

    # 3. ASSERT: Check the results
    # Check that PyPDFLoader was called with the correct file path
    mock_loader.assert_called_once_with('dummy/path/to/report.pdf')
    # Check that the function returned the document we faked
    assert documents == fake_pdf_docs
    assert documents[0].page_content == "This is a test PDF page."
    
# Add this inside tests/test_loader.py

def test_load_from_source_url_success(mocker):
    """
    Tests successful loading from a URL by mocking the WebBaseLoader.
    """
    # 1. ARRANGE
    fake_url_docs = [Document(page_content="This is web content.")]
    mock_loader = mocker.patch('app.core.document_loader.WebBaseLoader')
    mock_loader.return_value.load.return_value = fake_url_docs
    
    # 2. ACT
    documents = load_from_source(source_type='url', source_location='http://example.com')

    # 3. ASSERT
    mock_loader.assert_called_once_with('http://example.com')
    assert documents == fake_url_docs
    
# Add this inside tests/test_loader.py

def test_load_from_source_file_not_found(mocker):
    """
    Tests that FileNotFoundError is raised if the file does not exist.
    """
    # ARRANGE: Mock os.path.exists to simulate a missing file
    mocker.patch('os.path.exists', return_value=False)

    # ACT & ASSERT: Use pytest.raises to check for the expected exception
    with pytest.raises(FileNotFoundError, match="The file fake/path.pdf does not exist."):
        load_from_source(source_type='upload', source_location='fake/path.pdf')

# Add this inside tests/test_loader.py

def test_load_from_source_unsupported_source_type():
    """
    Tests that ValueError is raised for an unsupported source_type.
    """
    with pytest.raises(ValueError, match="Unsupported source type: ftp"):
        load_from_source(source_type='ftp', source_location='ftp://example.com')