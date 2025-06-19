from document_loader import load_document
from text_splitter import split_text
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import getpass
import os
from dotenv import load_dotenv
load_dotenv()
if not os.getenv("GOOGLE_API_KEY"):
  os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
def embedding_text(text: str) -> list:
    """
    Embed text using Google Generative AI embeddings.

    Args:
        text (str): The text to be embedded.

    Returns:
        function: A function that returns the embeddings for the text.
    """
    if not text:
        return []

    
    return embeddings.embed_query(text)
if __name__ == '__main__':
    # Example usage
    try:
        # Load a document (PDF or web content)
        document_content = load_document("dummy_docs/my_document.pdf")
        # Split the loaded text into chunks
        text_chunks = split_text(document_content, chunk_size=500, chunk_overlap=100)
        print(f"Number of chunks created: {len(text_chunks)}")
        
        # Embed each chunk
        for i, chunk in enumerate(text_chunks):
            embeddings = embedding_function(chunk.page_content)
            print(f"Chunk {i+1} embeddings: {embeddings[:5]}...")  # Print first 5 embedding values
            print(f"Chunk {i+1}: {chunk.page_content[:50]}...")
            print(f'length: {len(chunk.page_content)}')
            print(f'source: {chunk.metadata.get("source", "unknown")}\n')
    except Exception as e:
        print(f"Error: {e}")