import os
import getpass
import asyncio
from fastapi import FastAPI, Request
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from app.core.embedding_service import EmbeddingService
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
        # Check if Google API key is available
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            print("WARNING: GOOGLE_API_KEY not found in environment variables")
            # Don't use getpass in containerized environment
            raise RuntimeError("GOOGLE_API_KEY environment variable is required")
        
        print("Google API key found, initializing services...")
        
        # Initialize embedding service with timeout
        print("Initializing embedding service...")
        embeddings = EmbeddingService()
        
        print("Initializing text splitter service...")
        text_splitter_service = TextSplitterService(chunk_size=1000, chunk_overlap=200)
        
        print("Initializing vector store service...")
        vector_store_service = VectorStoreService(
            embedding_function=embeddings,
            persist_directory=os.getenv("CHROMA_DB_PATH", "./vector_store_db"),
            collection_name="documents",
        )
        
        print("Initializing pipelines...")
        processing_pipline = ProcessingPipeline(
            text_splitter=text_splitter_service,
            embedding_service = embeddings,
            vector_store_service=vector_store_service
        )
        
        rag_pipeline = RagPipeline(
            vector_store=vector_store_service,
            llm=ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2)
        )
        
        app.state.processing_pipeline = processing_pipline
        app.state.rag_pipeline = rag_pipeline
        print('AI Service initialized successfully.')
        
    except Exception as e:
        print(f"FATAL: Could not initialize services. Error: {e}")
        print("Service will not be fully functional. Check logs for details.")
        # Set default values to prevent crashes
        app.state.processing_pipeline = None
        app.state.rag_pipeline = None
        raise e
    
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

@app.get('/health')
def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "message": "Service is running"}


