
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings

from typing import List, Dict, Any

# refactored code to use Chroma as the vector store

class VectorStoreService:
    """Service for managing a vector store using Chroma."""
    
    _vector_store: Chroma
    
    def __init__(self,embedding_function: Embeddings, persist_directory: str ='./chroma_db', collection_name: str = 'default_collection'):
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
            self._vector_store.add_documents(documents=documents, 
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

    def get_retriever(self, search_kwargs: Dict[str, Any] = None) -> Any:
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
    def peek_collection(self, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Returns a list of documents from the vector store for inspection.

        Args:
            limit (int): The maximum number of documents to return.

        Returns:
            List[Document]: A list of Document objects.
        """
        try:
            data = self._vector_store.get(limit=limit)
            if not data or not data.get('ids'):
                print("Collection is empty or no documents found.")
                return []

            print(f'Peeking at collection... Founded {len(data["ids"])} documents.')

            formatted_docs = []
            # print(data)
            for i in range(len(data['ids'])):
                formatted_docs.append({
                    "id": data['ids'][i],
                    "page_content": data['documents'][i],
                    "metadata": data['metadatas'][i] if data['metadatas'] else {}
                })
            
            return formatted_docs
        except Exception as e:
            print(f"Error peeking into the database: {e}")
            return []
    
# --- Example of how to use this new service ---
if __name__ == '__main__':
    
    # 1. Initialize the embedding service first
    print("--- Loading embedding model ---")
    # In a real app, this would be a shared instance
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from dotenv import load_dotenv
    import os
    import getpass
    load_dotenv()
    if not os.getenv("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

    # 2. Initialize our VectorStoreService, passing the actual embedding function
    print("\n--- Initializing VectorStoreService ---")
    vector_store_service = VectorStoreService(
        embedding_function=embeddings, 
        persist_directory="./chroma_test_db"
    )

    # 3. Prepare LangChain Document objects to add
    print("\n--- Preparing documents for upsert ---")
    docs_to_add = [
        Document(
            page_content="The market for AI in healthcare is growing rapidly.",
            metadata={"file_id": "report-01", "chunk_number": 0, "user_id": "user-123"}
        ),
        Document(
            page_content="Consumer-facing AI applications are seeing major investment.",
            metadata={"file_id": "report-01", "chunk_number": 1, "user_id": "user-123"}
        ),
    ]
    # Create deterministic IDs
    doc_ids = ["report-01_chunk_0", "report-01_chunk_1"]

    # 4. Upsert the documents into the vector store
    vector_store_service.upsert_documents(documents=docs_to_add, ids=doc_ids)

    # 5. Peek into the database to verify the content
    print("\n--- Peeking into the vector store to verify ---")
    peeked_docs = vector_store_service.peek_collection(limit=5)
    for doc in peeked_docs:
        print(f"ID: {doc['id']}")
        print(f"Content: {doc['page_content']}")
        print(f"Metadata: {doc['metadata']}")
        print("-" * 40)
        
    # 6. Get a retriever and perform a search
    print("\n--- Testing the retriever ---")
    retriever = vector_store_service.get_retriever(search_kwargs={"k": 1})
    if retriever:
        query = "What is the trend for AI in the medical field?"
        search_results = retriever.invoke(query)
        
        print(f"\nQuery: '{query}'")
        print("Top Result from Retriever:")
        for doc in search_results:
            print(f"  - Content: {doc.page_content}")
            print(f"  - Metadata: {doc.metadata}")
