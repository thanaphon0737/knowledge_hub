import os
from langchain.document_loaders import PyPDFLoader, WebBaseLoader

def load_document(file_type:str,file_path: str):
    """
    Load a PDF file and return its text content.

    Args:
        file_path (str): The path to the PDF file.

    Returns:
        str: The text content of the PDF file.
    """
    text_content = ""
    if file_type == 'pdf':
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file {file_path} does not exist.")
        try:
            reader = PyPDFLoader(file_path)
            text_content = reader.load_and_split()
            # for page in reader.pages:
            #     text_content += page.extract_text() or ""
        except Exception as e:
            raise RuntimeError(f"Failed to read PDF file {file_path}: {e}")
    elif file_type == 'url':
        try:
            loader = WebBaseLoader(file_path)
            text_content = loader.load()
        except Exception as e:
            raise RuntimeError(f"Failed to load web content from {file_path}: {e}")
    return text_content

if __name__ == '__main__':
    # Create dummy files for testing

    print("\n--- Testing PDF file ---")
    # Note: Uncomment the following lines if you have a sample PDF file to test.
    try:
        pdf_content = load_document("dummy_docs/my_document.pdf")
        print(f'{pdf_content}\n type: {type(pdf_content)} \n')
    except (FileNotFoundError, ValueError) as e:
        print(e)
    print("\n--- Testing web content ---")
    try:
        web_content = load_document("https://mikelopster.dev/posts/auth-express")
        print(f'{web_content}\n type: {type(web_content)} \n')
    except (FileNotFoundError, ValueError) as e:
        print(e)
