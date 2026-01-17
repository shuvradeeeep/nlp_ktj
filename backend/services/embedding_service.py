"""
Embedding Service using FastEmbed
Fast, lightweight text embeddings for RAG pipeline
"""

import logging
from typing import List, Optional
from fastembed import TextEmbedding

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmbeddingService:
    """
    Text Embedding Service using FastEmbed
    Generates embeddings for text chunks and queries
    Uses BAAI/bge-small-en-v1.5 by default (384 dimensions, fast & efficient)
    """
    
    def __init__(self):
        self.model_name = settings.embedding_model
        self._model: Optional[TextEmbedding] = None
    
    def _get_model(self) -> TextEmbedding:
        """Lazy load the embedding model"""
        if self._model is None:
            logger.info(f"Loading FastEmbed model: {self.model_name}")
            self._model = TextEmbedding(model_name=self.model_name)
            logger.info("FastEmbed model loaded successfully")
        return self._model
    
    async def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text string
        
        Args:
            text: Text to embed
        
        Returns:
            Embedding vector as list of floats
        """
        try:
            model = self._get_model()
            # FastEmbed returns a generator, convert to list
            embeddings = list(model.embed([text]))
            embedding = embeddings[0].tolist()
            logger.debug(f"Generated text embedding with dimension {len(embedding)}")
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating text embedding: {str(e)}")
            raise
    
    async def embed_query(self, query: str) -> List[float]:
        """
        Generate embedding for a search query
        (Alias for embed_text for consistency with RAG interface)
        
        Args:
            query: User's text question
        
        Returns:
            Embedding vector as list of floats
        """
        return await self.embed_text(query)
    
    async def embed_texts_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batch
        More efficient for processing multiple chunks
        
        Args:
            texts: List of text strings
        
        Returns:
            List of embedding vectors
        """
        try:
            if not texts:
                return []
            
            model = self._get_model()
            
            # FastEmbed handles batching efficiently
            embeddings = list(model.embed(texts))
            result = [emb.tolist() for emb in embeddings]
            
            logger.info(f"Generated {len(result)} embeddings in batch")
            return result
            
        except Exception as e:
            logger.error(f"Error in batch embedding: {str(e)}")
            raise


# Singleton instance
embedding_service = EmbeddingService()
