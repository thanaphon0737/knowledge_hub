import json
import os
import asyncio
from typing import List, Dict, Any, Tuple, Optional
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.document_loader import load_from_source
from app.core.text_splitter import TextSplitterService
from app.core.vector_store import VectorStoreService


class ProcessingPipeline:
    
    def __init__(self,text_splitter: TextSplitterService, vector_store_service: VectorStoreService): 
        self.text_splitter = text_splitter
        self.vector_store_service = vector_store_service
        print(f"ProcessingPipeline initialized with TextSplitterService and VectorStoreService.")

    def _prepare_documents_for_store(
        self,
        chunks: List[Document],
        file_id: str,
        user_id: str
    ) -> Tuple[List[Document], List[str]]:
        """        Prepares lists of IDs, metadatas, and document contents from chunks.
        """
        ids = []
        for i, chunk in enumerate(chunks):
            
            chunk_id = f'{file_id}_chunk_{i}'
            ids.append(chunk_id)
            
            chunk.metadata['file_id'] = file_id
            chunk.metadata['user_id'] = user_id
            chunk.metadata['chunk_number'] = i
            
        return chunks, ids
            
    async def execute(self, file_id: str, user_id: str, source_type: str, source_location: str):
        
        print(f"Processing pipeline started for file_id: {file_id}")
        
        loaded_docs = load_from_source(source_type, source_location)
        
        chunks = self.text_splitter.split_documents(loaded_docs)
        
        prepared_docs, doc_ids = self._prepare_documents_for_store(chunks, file_id, user_id)
        
        self.vector_store_service.upsert_documents(
            documents=prepared_docs,
            ids=doc_ids,
        )
        
        print(f'Processing pipeline finished for file_id: {file_id}')
        
        
class RagPipeline:
    
    def __init__(self,vector_store: VectorStoreService,llm: Optional[ChatGoogleGenerativeAI] = None): 
        self.vector_store = vector_store
        self.llm = llm
        print("RagePipeline initialized with VectorStoreService.")
    
    def _build_prompt(self, question: str, context_docs: List[Document]) -> str:
        """
        Builds a comprehensive prompt for the LLM by combining a template
        with the retrieved context and the user's question.
        """
        context = "\n\n---\n\n".join([doc.page_content for doc in context_docs])
        
        prompt_template = f"""
        You are a helpful assistant. Answer the following question based ONLY on the context provided below.
        If the context does not contain the answer, say "I cannot find the answer in the provided documents."

        Context:
        {context}

        Question:
        {question}

        Answer:
        """
        return prompt_template.strip()
    async def get_answer(self, user_id: str, question: str) -> Dict[str, Any]:
        
        
        retriever = self.vector_store.get_retriever(search_kwargs={'k': 3,"filter": {"user_id": user_id}})
        
        retrieved_docs = retriever.invoke(question)
        
        if not retrieved_docs:
            return {"answer": "I cannot find the answer in the provided documents.", "sources": []}
        
        prompt = self._build_prompt(question, retrieved_docs)
        # print(f'Prompt Template:\n{prompt}')   
        # print(f'Retrive Docs: {retrieved_docs}')
        llm = self.llm
        response = llm.invoke(prompt)
        generated_answer = response.content
        
        sources = [
            {
                "page_content": doc.page_content,
                "metadata": doc.metadata,
            }
            for doc in retrieved_docs
        ] 
        # print(f"Generated Answer: {generated_answer}")
        print(f"Sources: {type(sources)}")
        print(f"Sources: {sources[0]}")
        result = {"answer": generated_answer, "sources": sources}
        # response_ans = json.dumps(result, indent=2, ensure_ascii=False)
        return result

if __name__ == "__main__":
    
    # --- 1. One-time Setup of Services (Dependency Injection) ---
    print("--- Initializing Core Services ---")
    # In a real FastAPI app, this setup would happen once at startup in main.py
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from dotenv import load_dotenv
    import os
    import getpass
    load_dotenv()
    if not os.getenv("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    embedding_service = embeddings
    text_splitter_service = TextSplitterService(chunk_size=1000, chunk_overlap=200)
    vector_store_service = VectorStoreService(
        embedding_function=embedding_service,
        persist_directory="./vector_store_db"
    )

    # --- 2. Create Instances of the Pipelines, Injecting Services ---
    processing_pipeline = ProcessingPipeline(
        text_splitter=text_splitter_service,
        vector_store_service=vector_store_service
    )
    rag_pipeline = RagPipeline(vector_store=vector_store_service)

    # --- 3. Define an async main function to run the pipelines ---
    async def main():
        # --- Example: Run the Processing Pipeline ---
        # This simulates receiving a request to process a new file.
        # Make sure you have the dummy file at this path.
        pdf_path = "./dummy_docs/report-001.pdf"
        if os.path.exists(pdf_path):
             await processing_pipeline.execute(
                 file_id="report-001",
                 user_id="user-123",
                 source_type="upload",
                 source_location=pdf_path
             )
        else:
            print(f"Warning: Test PDF not found at {pdf_path}. Skipping processing pipeline.")
            # Let's add some data manually for the RAG test to work
            docs = [Document(page_content="The registration date for new students is October 15th.", metadata={"file_id":"manual-doc"})]
            vector_store_service.upsert_documents(docs, ids=["manual-doc_chunk_0"])


        # --- Example: Run the RAG Pipeline ---
        # This simulates receiving a query from a user.
        result = await rag_pipeline.get_answer(
            user_id="user-123",
            question="วันลงทะเบียนเพื่อบริการของมหาลัยวันที่เท่าไหร่?" # "What is the university registration date?"
        )
        
        print("\n--- RAG Final Result ---")
        import json
        # Use json.dumps for pretty printing the result
        print(json.dumps(result, indent=2, ensure_ascii=False))

    # --- 4. Run the async main function ---
    asyncio.run(main())