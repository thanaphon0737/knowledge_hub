from document_loader import load_document
from langchain.text_splitter import RecursiveCharacterTextSplitter

def split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list:
    """
    Split text into smaller chunks for processing.

    Args:
        text (str): The text to be split.
        chunk_size (int): The size of each chunk.
        chunk_overlap (int): The number of overlapping characters between chunks.

    Returns:
        list: A list of text chunks.
    """
    if not text:
        return []

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len
    )
    
    return text_splitter.split_documents(text)

if __name__ == '__main__':
    
    # Example usage
    try:
        # Load a document (PDF or web content)
        document_content = load_document("dummy_docs/my_document.pdf")
        # Split the loaded text into chunks
        text_chunks = split_text(document_content, chunk_size=500, chunk_overlap=100)
        print(f"Number of chunks created: {len(text_chunks)}")
        for i, chunk in enumerate(text_chunks):
            print(f"Chunk {i+1}: {chunk}...")  # Print first 50 characters of each chunk
            print(f'source: {chunk.metadata.get("source", "unknown")}\n')
    except Exception as e:
        print(f"Error: {e}")