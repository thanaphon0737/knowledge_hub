import os
from typing import List
from sentence_transformers import SentenceTransformer
from langchain_core.embeddings import Embeddings
from PIL import Image

class EmbeddingService(Embeddings):
    """
    A LangChain-compatible service class for handling embeddings using BGE-M3.
    It inherits from LangChain's Embeddings base class.
    """
    def __init__(self, model_name: str = 'BAAI/bge-m3'):
        self.model = SentenceTransformer(model_name)
        print(f"EmbeddingService initialized with multimodal model: {model_name}")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embeds a list of text documents. This method is required by LangChain.
        """
        if not texts: return []
        print(f"Embedding a batch of {len(texts)} text documents...")
        return self.model.encode(texts, normalize_embeddings=True).tolist()

    def embed_query(self, text: str) -> List[float]:
        """
        Embeds a single query string. This method is required by LangChain.
        """
        if not text: return []
        print(f"Embedding single query: '{text[:50]}...'")
        return self.model.encode(text, normalize_embeddings=True).tolist()

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