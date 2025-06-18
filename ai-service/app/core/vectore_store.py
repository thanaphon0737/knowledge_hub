from document_loader import load_document
from text_splitter import split_text
from embedding_service import embeddings
from langchain_chroma import Chroma

# create vector store using Chroma
vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings,
    persist_directory="./chroma_langchain_db",  # Where to save data locally, remove if not necessary
)
def add_document_to_vector_store(file_path: str):
    """
    Load a document, split it into chunks, and add it to the vector store.

    Args:
        file_path (str): The path to the document file (PDF or web URL).
    """
    try:
        # Load the document
        document_content = load_document(file_path)
        
        # Split the document into chunks
        text_chunks = split_text(document_content)
        
        # Add each chunk to the vector store
        for chunk in text_chunks:
            vector_store.add_texts([chunk.page_content], metadatas=[chunk.metadata])
        
        # Persist changes to the vector store
        # vector_store.persist()
        print(f"Document '{file_path}' added to vector store successfully.")
    
    except Exception as e:
        print(f"Error adding document to vector store: {e}")
        
def search_vector_store(query: str, top_k: int = 3):
    """
    Search the vector store for similar documents based on a query.

    Args:
        query (str): The search query.
        top_k (int): The number of top results to return.

    Returns:
        list: A list of search results.
    """
    try:
        results = vector_store.similarity_search(query, k=top_k)
        return results
    except Exception as e:
        print(f"Error searching vector store: {e}")
        return []
def query_with_retriever(query: str, top_k: int = 3):
    """
    Query the vector store and retrieve relevant documents.

    Args:
        query (str): The search query.
        top_k (int): The number of top results to return.

    Returns:
        list: A list of retrieved documents.
    """
    try:
        retriever = vector_store.as_retriever(search_kwargs={"k": top_k})
        relevant_docs = retriever.invoke(query)
        return relevant_docs
    except Exception as e:
        print(f"Error querying vector store: {e}")
        return []
    
def clear_vector_store():
    """
    Clear the vector store by deleting all documents.
    """
    try:
        vector_store.delete_collection()
        print("Vector store cleared successfully.")
    except Exception as e:
        print(f"Error clearing vector store: {e}")
def peek_document_in_vector_store(collection_name: str):
    """
    Peek into the vector store to see if a document exists.

    Args:
        collection_name (str): The name of the collection to peek into.
    """
    try:
        # Check if the collection exists
        if vector_store.get():
            print(f"Collection '{collection_name}' exists in the vector store.")
            results = vector_store.get()
            # print(f'results: {results}')
            print(f'{results.keys()}\n')
            formatted_docs = []
            documents = results['documents']
            metadatas = results['metadatas']
            # print(f'{documents.keys()}\n')
            # print(f'{metadatas.keys()}\n')
            for doc, metadata in zip(documents, metadatas):
                print(f'sorce: {metadata.get("source", "unknown")}')
                formatted_docs.append({
                    "content": doc,
                    "metadata": metadata
                })
            print(f"Number of documents in collection '{collection_name}': {len(formatted_docs)}")
            
            return {"documents": formatted_docs}
        else:
            print(f"Collection '{collection_name}' does not exist in the vector store.")
    except Exception as e:
        print(f"Error peeking into vector store: {e}")
    
if __name__ == '__main__':
    # Example usage
    try:
        # Add a document to the vector store
        # add_document_to_vector_store("dummy_docs/my_document.pdf")
        # clear_vector_store()
        # add_document_to_vector_store("https://mikelopster.dev/posts/auth-express")
        peek_document_in_vector_store("example_collection")
        
        # # Search the vector store
        # query = "what is authentication?"
        # results = query_with_retriever(query)
        
        # print(f"Search results for query '{query}':")
        # for result in results:
        #     print(f"Content: {result.page_content[:100]}...")  # Print first 100 characters
        #     print(f"Source: {result.metadata.get('source', 'unknown')}\n")
        #     # print(f"Score: {result.score}\n")
        #     print(f"Document ID: {result.id}\n")
        #     print(f'metadata: {result.metadata}\n')
    
    except Exception as e:
        print(f"Error: {e}")