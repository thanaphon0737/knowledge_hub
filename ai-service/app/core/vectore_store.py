from document_loader import load_document
from text_splitter import split_text
from embedding_service import embeddings
from langchain_chroma import Chroma
from langchain.schema import Document
from typing import List, Dict, Any

# refactored code to use Chroma as the vector store

class VectorStoreService:
    """Service for managing a vector store using Chroma."""
    
    _vector_store: Chroma
    
    def __init__(self,embedding_function: embeddings, persist_directory: str ='./chroma_db', collection_name: str = 'default_collection'):
        self._vector_store = Chroma(
            collection_name=collection_name,
            embedding_function=embedding_function,
            persist_directory=persist_directory  # Where to save data locally, remove if not necessary
        )
        print(f'LangChian Chroma vector store initialized with collection: {collection_name}')
        
    def upsert_documents(self, documents: List[Document], ids: List[str]) ->None:
        
        if not (len(documents) == len(ids)):
            raise ValueError("The number of documents must match the number of IDs.")
        try:
            self._vector_store.add_texts([doc.page_content for doc in documents], 
                                         metadatas=[doc.metadata for doc in documents], 
                                         ids=ids)
            print(f"Upserted {len(documents)} documents into the vector store.")
        except Exception as e:
            print(f"Error upserting documents: {e}")
            raise
    def similarity_search(self, query: str, k: int = 3) -> List[Document]:
        try:
            results = self._vector_store.similarity_search(query, k=k)
            return results
        except Exception as e:
            print(f"Error searching vector store: {e}")
            return []

    def as_retriever(self, search_kwargs: Dict[str, Any] = None) -> Any:
        """
        Returns a retriever for the vector store.

        Args:
            search_kwargs (Dict[str, Any], optional): Additional search parameters.

        Returns:
            Any: A retriever object.
        """
        try:
            retriever = self._vector_store.as_retriever(search_kwargs=search_kwargs)
            return retriever
        except Exception as e:
            print(f"Error creating retriever: {e}")
            return None
    def peekDatabase(self, limit: int = 5) -> List[Document]:
        """
        Returns a list of documents from the vector store for inspection.

        Args:
            limit (int): The maximum number of documents to return.

        Returns:
            List[Document]: A list of Document objects.
        """
        try:
            docs = self._vector_store.get()
            print(docs.keys())
            if docs:
                print(f'Collection contains {len(docs)} documents.')
                formatted_docs = []
                documents = docs['documents']
                metadatas = docs['metadatas']
                for doc, metadata in zip(documents, metadatas):
                    formatted_docs.append({
                        "page_content": doc,
                        "metadata": metadata
                    })
            return formatted_docs
        except Exception as e:
            print(f"Error peeking into the database: {e}")
            return []
    
# --- Example of how to use this new service ---
if __name__ == '__main__':
    
    
    # 1. Initialize the embedding model first
    print("--- Loading embedding model ---")
    # This is the same model you would use throughout your application
    embedding_function = embeddings

    # 2. Initialize our new VectorStoreService with the embedding function
    print("\n--- Initializing VectorStoreService ---")
    vector_store_service = VectorStoreService(embedding_function=embedding_function, persist_directory="./chroma_test_db")

    # 3. Create LangChain Document objects to add
    print("\n--- Preparing documents for upsert ---")
    docs_to_add = [
        Document(
            page_content="The market for AI in healthcare is growing rapidly.",
            metadata={"file_id": "report-01", "chunk_number": 0}
        ),
        Document(
            page_content="Consumer-facing AI applications are seeing major investment.",
            metadata={"file_id": "report-01", "chunk_number": 1}
        ),
    ]
    doc_ids = ["report-01_chunk_0", "report-01_chunk_1"]

    # 4. Upsert the documents
    # vector_store_service.upsert_documents(docs_to_add, doc_ids)

    # # 5. Perform a similarity search
    # print("\n--- Performing similarity search ---")
    # query = "What is the trend for AI in the medical field?"
    # search_results = vector_store_service.similarity_search(query, k=1)

    # print(f"\nQuery: '{query}'")
    # print("Top Result:")
    # for doc in search_results:
    #     print(f"  - Content: {doc.page_content}")
    #     print(f"  - Metadata: {doc.metadata}")   
    # # 6. Peek into the database
    print("\n--- Peeking into the vector store database ---")
    peeked_docs = vector_store_service.peekDatabase(limit=5)
    print(peeked_docs[0].keys())
    for doc in peeked_docs:
        print(f"Content: {doc['page_content']}...")  # Print first 50 characters
        print(f"Metadata: {doc['metadata']}")
        print("-" * 40)
