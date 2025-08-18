import os
from typing import List
from sentence_transformers import SentenceTransformer
from langchain_core.embeddings import Embeddings
from PIL import Image
import time

class EmbeddingService(Embeddings):
    """
    A LangChain-compatible service class for handling embeddings using a lightweight model.
    It inherits from LangChain's Embeddings base class.
    """
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        print(f"Initializing EmbeddingService with model: {model_name}")
        start_time = time.time()
        
        try:
            # Use a smaller, faster model that's more suitable for production
            self.model = SentenceTransformer(model_name)
            print(f"EmbeddingService initialized successfully with model: {model_name}")
            print(f"Model loading took {time.time() - start_time:.2f} seconds")
        except Exception as e:
            print(f"Error initializing EmbeddingService: {e}")
            # Fallback to a very basic embedding (not recommended for production)
            print("Falling back to basic embedding service...")
            self.model = None
            raise e

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embeds a list of text documents. This method is required by LangChain.
        """
        if not texts: 
            return []
        if not self.model:
            raise RuntimeError("Embedding model not initialized")
            
        print(f"Embedding a batch of {len(texts)} text documents...")
        try:
            return self.model.encode(texts, normalize_embeddings=True).tolist()
        except Exception as e:
            print(f"Error in embed_documents: {e}")
            raise

    def embed_query(self, text: str) -> List[float]:
        """
        Embeds a single query string. This method is required by LangChain.
        """
        if not text: 
            return []
        if not self.model:
            raise RuntimeError("Embedding model not initialized")
            
        print(f"Embedding single query: '{text[:50]}...'")
        try:
            return self.model.encode(text, normalize_embeddings=True).tolist()
        except Exception as e:
            print(f"Error in embed_query: {e}")
            raise

    def embed_image(self, image_path: str) -> List[float]:
        """
        Custom method to embed a single image file.
        """
        print(f"Embedding image from path: {image_path}")
        try:
            image = Image.open(image_path)
            return self.model.encode(image, normalize_embeddings=True).tolist()
        except Exception as e:
            print(f"Error opening or embedding image: {e}")
            raise