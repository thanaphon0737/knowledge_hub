import os
from langchain.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_core.documents import Document
from typing import List
def load_from_source(source_type:str,source_location: str)-> List[Document]:
    """Load a document from a specified source type and location.
    Args:
        source_type (str): Type of the source (e.g., 'pdf', 'url').
        source_location (str): Location of the source (e.g., file path or URL).
    Returns:
        List[Document]: A list of Document objects containing the loaded content.
    Raises:
        FileNotFoundError: If the specified file does not exist.
        ValueError: If the source type is not supported.
    """
    
    print(f"Loading {source_type} from {source_location}")
    
    loader = None
    text_content = ""
    if source_type == 'upload':
        if not os.path.exists(source_location):
            raise FileNotFoundError(f"The file {source_location} does not exist.")
        file_extension = os.path.splitext(source_location)[1].lower()
        if file_extension == '.pdf':
            loader = PyPDFLoader(source_location)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
    elif source_type == 'url':
        loader = WebBaseLoader(source_location)
    else:
        raise ValueError(f"Unsupported source type: {source_type}")
    try:
        documents = loader.load()
        print(f"Loaded {len(documents)} page(s) from {source_location}")
        return documents
    except Exception as e:
        raise RuntimeError(f"Failed to load document from {source_location}: {e}")

if __name__ == '__main__':
    # --- Testing a PDF file ---
    print("\n--- Testing PDF file ---")
    # Make sure you have this path and file for the test
    pdf_file_path = "dummy_docs/report-001.pdf" 
    if os.path.exists(pdf_file_path):
        try:
            pdf_docs = load_from_source(source_type='upload', source_location=pdf_file_path)
            print(f"Loaded {len(pdf_docs)} page(s) from PDF.")
            # Print the metadata of the first page to see what LangChain provides
            if pdf_docs:
                print("Metadata of first page:", pdf_docs[0].metadata)
                # print("Content snippet:", pdf_docs[0].page_content[:100] + "...")
        except (FileNotFoundError, ValueError, RuntimeError) as e:
            print(f"Error: {e}")
    else:
        print(f"Test PDF not found at '{pdf_file_path}', skipping PDF test.")

    # --- Testing a web URL ---
    print("\n--- Testing web content ---")
    web_url = "https://lilianweng.github.io/posts/2023-06-23-agent/" # A well-known blog post on RAG
    try:
        web_docs = load_from_source(source_type='url', source_location=web_url)
        print(f"Loaded {len(web_docs)} document(s) from URL.")
        if web_docs:
            # The WebBaseLoader typically returns one document for the whole page
            print("Metadata from URL:", web_docs[0].metadata)
            print("Content snippet:", web_docs[0].page_content[:50] + "...")
    except (ValueError, RuntimeError) as e:
        print(f"Error: {e}")
