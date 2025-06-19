import os
import getpass
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from contextlib import asynccontextmanager


from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.text_splitter import TextSplitterService
from app.core.vector_store import VectorStoreService
from app.core.pipeline import ProcessingPipeline, RagPipeline


from app.api.v1 import endpoints as v1_endpoints

@asynccontextmanager

async def lifespan(app: FastAPI):
    
    print("--- Initializing services ---")
    load_dotenv()
    
    print("Initializing Core Service...")
    
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        text_splitter_service = TextSplitterService(chunk_size=1000, chunk_overlap=200)
        vector_store_service = VectorStoreService(
            embedding_function=embeddings,
            persist_directory=os.getenv("CHROMA_DB_PATH", "./vector_store_db"),
            collection_name="documents",
        )
    except Exception as e:
        print(f"FATAL: Could not initialize services. Check .env file. Error: {e}")
        raise
    
    print("initializing pipelines...")
    processing_pipline = ProcessingPipeline(
        text_splitter=text_splitter_service,
        vector_store_service=vector_store_service
    )
    rag_pipeline = RagPipeline(vector_store=vector_store_service,llm=ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2))
    
    app.state.processing_pipeline = processing_pipline
    app.state.rag_pipeline = rag_pipeline
    print('AI Service initialized successfully.')
    yield
    
    print('AI Service shutting down...')
    
app = FastAPI(title="My FastAPI Application",
              description="A service for processing and documents and answering questions using RAG.",
              version="1.0.0",
              lifespan=lifespan)


app.include_router(v1_endpoints.router, prefix="/api/v1", tags=["v1"])

@app.get('/')
def read_root():
    return {"message": "Welcome to My FastAPI Application!"}


