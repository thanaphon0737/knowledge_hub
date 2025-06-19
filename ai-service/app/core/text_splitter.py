from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List
from langchain_core.documents import Document

from document_loader import load_from_source

class TextSplitterService:
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        print(f"TextSplitterService initialized with chunk_size={chunk_size}, chunk_overlap={chunk_overlap}")
        
    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        Split a list of documents into smaller chunks.

        Args:
            documents (List[Document]): A list of LangChain Document objects.

        Returns:
            List[Document]: A list of Document objects after splitting.
        """
        if not documents:
            return []
        print(f"Splitting {len(documents)} documents into chunks...")
        chunks = self.text_splitter.split_documents(documents)
        print(f"Created {len(chunks)} chunks from {len(documents)} documents.")
        return chunks
    
    
if __name__ == '__main__':
    # This block demonstrates the full flow from loading to splitting.
    
    # Prerequisite: You need a 'dummy_docs' folder with a 'my_document.pdf' file.
    PDF_FILE_PATH = "dummy_docs/report-001.pdf"
    
    try:
        # 1. Load the document first. This returns a List[Document].
        print("--- Step 1: Loading document ---")
        # In a real app, load_from_source would be called from the main pipeline.
        initial_documents = load_from_source(source_type='upload', source_location=PDF_FILE_PATH)

        # 2. Create an instance of the splitter service.
        print("\n--- Step 2: Initializing TextSplitterService ---")
        splitter_service = TextSplitterService(chunk_size=500, chunk_overlap=100)
        
        # 3. Split the loaded documents into chunks.
        print("\n--- Step 3: Splitting documents ---")
        text_chunks = splitter_service.split_documents(initial_documents)
        
        # 4. Inspect the results.
        print(f"\n--- Results ---")
        print(f"Total number of chunks created: {len(text_chunks)}")
        
        if text_chunks:
            print("\n--- Example of the first chunk ---")
            first_chunk = text_chunks[0]
            print(f"Content Snippet: '{first_chunk.page_content[:150]}...'")
            print(f"Content Length: {len(first_chunk.page_content)}")
            print(f"Metadata: {first_chunk.metadata}") # Metadata is preserved!
            
            print("\n--- Example of the second chunk ---")
            second_chunk = text_chunks[1]
            print(f"Content Snippet: '{second_chunk.page_content[:150]}...'")
            print(f"Content Length: {len(second_chunk.page_content)}")
            print(f"Metadata: {second_chunk.metadata}")
            
    except FileNotFoundError as e:
        print(f"\nERROR: Test file not found. Please ensure this file exists: {PDF_FILE_PATH}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")