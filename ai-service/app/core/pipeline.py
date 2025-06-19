from document_loader import load_document
from text_splitter import split_text
from embedding_service import embeddings # สมมติว่าสร้างเป็น instance แล้ว
from vector_store import VectorStoreService # สมมติว่าสร้างเป็น instance แล้ว
from langchain.schema import Document
from langchain_google_genai import ChatGoogleGenerativeAI
def peek_database(vector_store_service: VectorStoreService, limit: int = 5) -> list[Document]:
    """
    Retrieves a limited number of documents from the vector store for inspection.

    Args:
        vector_store_service: An instance of VectorStoreService.
        limit: The maximum number of documents to retrieve.

    Returns:
        A list of Document objects from the vector store.
    """
    try:
        documents = vector_store_service.peekDatabase(limit=limit)
        return documents
    except Exception as e:
        print(f"Error peeking into the database: {e}")
        return []
def prepare_for_vector_store(chunks: list[Document], file_id: str, user_id: str) -> tuple[list[str], list[dict[str, any]], list[str]]:
    """
    Prepares lists of IDs, metadatas, and document contents from chunks.

    Args:
        chunks: A list of LangChain Document objects (the result of a text splitter).
        file_id: The unique ID of the source file from PostgreSQL.
        user_id: The unique ID of the user who owns the file.

    Returns:
        A tuple containing three lists:
        - A list of unique, meaningful IDs for each chunk.
        - A list of metadata dictionaries for each chunk.
        - A list of the text content for each chunk.
    """
    
    ids = []
    metadatas = []
    
    for i, chunk in enumerate(chunks):
        # --- ID Generation ---
        # Create a unique and deterministic ID for each chunk.
        # Format: {file_id}_chunk_{chunk_index}
        # Example: "f-12345_chunk_0"
        
        chunk_id = f"{file_id}_chunk_{i}"
        ids.append(chunk_id)
        
        # --- Metadata Generation ---
        # Create a rich metadata object for each chunk.
        # This is the "bridge" back to our relational database and business logic.
        chunk_metadata = {
            "file_id": file_id,
            "user_id": user_id,
            "chunk_number": i,
            # We also preserve the original metadata from the loader (e.g., page number)
            **chunk.metadata 
        }
        metadatas.append(chunk_metadata)
        
        documents_contents = [chunk.page_content for chunk in chunks]
    return ids, metadatas, documents_contents


async def process_document_pipeline(file_id: str, user_id: str, source_type: str, source_location: str):
    # 1. โหลดเอกสาร
    documents = load_document(source_type, source_location)
    
    # 2. แบ่งเป็น Chunks
    chunks = split_text(documents) # สมมติว่ามีฟังก์ชันนี้
    print(f"Number of chunks created: {len(chunks)}")
    # print(chunks.keys())
    print(chunks[0].metadata) # แสดง metadata ของ chunk แรก
    for i, chunk in enumerate(chunks):
        print(f"Chunk {i+1}: {chunk.page_content[:50]}...")
        
    # 3. สร้าง ID และ Metadata
    # ... (Logic การสร้าง IDs และ Metadatas) ...
    ids, metadatas, documents_contents = prepare_for_vector_store(chunks, file_id, user_id)
    
    # for doc in documents_contents:
    #     print(f"Document content: {doc[:50]}...")
    # print(f"Number of documents prepared for vector store: {len(documents_contents)}")
    
    # 4. สร้าง Embeddings
    # ... (Logic การเรียก embedding_service) ...
    
    # 5. บันทึกลง Vector Store
    # ... (Logic การเรียก vector_store_service) ...
    vector_store_service = VectorStoreService(embedding_function=embeddings, persist_directory="./vector_store_db")
    vector_store_service.upsert_documents(
        documents = documents_contents,
        ids = ids,
        metadatas=metadatas
    )
    
        
    
    
    print(f"Pipeline finished for file_id: {file_id}")

def build_prompt(question: str, retrieved_docs: list[Document]) -> str:
        """
        Builds a comprehensive prompt for the LLM by combining a template
        with the retrieved context and the user's question.
        """
        # Extracts the text content from the retrieved chunks.
        # print(retrieved_docs.keys())
        context = "\n\n---\n\n".join([chunk.page_content for chunk in retrieved_docs])

        # A good prompt template is key to getting good answers.
        prompt_template = f"""
        You are a helpful assistant. Answer the following question based ONLY on the context provided below.
        If the context does not contain the answer, say "I cannot find the answer in the provided documents."

        Context:
        {context}

        Question:
        {question}

        Answer:
        """
        print(f'Prompt Template:\n{prompt_template}')
        return prompt_template.strip()
async def get_rag_answer(user_id: str, question: str, document_ids: list | None):
    # ... (Logic ของ RAG ทั้งหมดจะอยู่ที่นี่) ...
    print("RAG pipeline started...")
    
    
    # 1. Embed a question
    
    # 2. Query Vector Store
    # use retriver from VectorStoreService
    vector_store_service = VectorStoreService(embedding_function=embeddings, persist_directory="./vector_store_db")
    retriever = vector_store_service.get_retriever(search_kwargs={'k': 3})
    retrieve_docs = retriever.invoke(question)
    
    
    # 3. Build a prompt
    prompt = build_prompt(question, retrieve_docs)
    # 4. Call LLM
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)
    generated_answer = llm.invoke(prompt) 
    
    return generated_answer, [] # คืนค่าคำตอบและ sources

if __name__ == "__main__":
    # ตัวอย่างการเรียกใช้ pipeline
    import asyncio
    # asyncio.run(process_document_pipeline("report-001", "user-1", "pdf", "./dummy_docs/report-001.pdf"))
    # asyncio.run(process_document_pipeline("report-002", "user-1", "url", "https://mikelopster.dev/posts/auth-express"))
    
    # formatted_docs = peek_database(vector_store_service=VectorStoreService(embedding_function=embeddings, persist_directory="./vector_store_db"), limit=5)
    # for doc in formatted_docs:
    #     print(f"Document ID: {doc}\n Content: {doc['page_content'][:20]}...")
        
    # v = VectorStoreService(embedding_function=embeddings, persist_directory="./vector_store_db")
    # print(v._vector_store.get())
    # ตัวอย่างการเรียกใช้ RAG
    answer, sources = asyncio.run(get_rag_answer("user-1", "วันลงทะเบียนเพื่อบริการของมหาลัยวันที่เท่าไหร่?",None))
    print(f"Answer: {answer}, Sources: {sources}")