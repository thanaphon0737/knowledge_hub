import os
from langchain.document_loaders import PyPDFLoader, WebBaseLoader
from langchain_core.documents import Document
from typing import List
import requests

def download_file_from_url(signed_url: str, save_directory: str = "temp_files") -> str | None:
    """
    Downloads a file from a given URL and saves it to a local directory.

    Args:
        signed_url (str): The temporary signed URL from Supabase.
        save_directory (str): The local directory to save the file in.

    Returns:
        str | None: The full local path to the downloaded file, or None if failed.
    """
    try:
        print(f"Attempting to download file from signed URL...")
        response = requests.get(signed_url, stream=True)
        
        # Check if the request was successful (status code 200)
        response.raise_for_status()

        # Extract original filename from the URL's headers if possible, or create a generic one
        # This part is optional but good practice
        content_disposition = response.headers.get('content-disposition')
        if content_disposition:
            # A simple way to parse the filename
            filename = content_disposition.split('filename=')[-1].strip('"')
        else:
            filename = signed_url.split('/')[-1].split('?')[0] # Fallback filename

        # Create the save directory if it doesn't exist
        os.makedirs(save_directory, exist_ok=True)
        local_filepath = os.path.join(save_directory, filename)

        print(f"Saving downloaded file to: {local_filepath}")
        
        # Write the file content chunk by chunk
        with open(local_filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print("File downloaded successfully.")
        return local_filepath

    except requests.exceptions.RequestException as e:
        print(f"Error downloading file: {e}")
        return None

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
        sigend_url = source_location  # Assume this is a signed URL from Supabase
        local_file_path = download_file_from_url(sigend_url)
        if not os.path.exists(local_file_path):
            raise FileNotFoundError(f"The file {local_file_path} does not exist.")
        file_extension = os.path.splitext(local_file_path)[1].lower()
        if file_extension == '.pdf':
            loader = PyPDFLoader(local_file_path)
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
