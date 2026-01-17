"""
Vector Store Service using Pinecone
Handles storage and retrieval of text chunk embeddings
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from pinecone import Pinecone, ServerlessSpec

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class VectorStore:
    """
    Vector Store Service using Pinecone
    Stores text chunk embeddings with metadata for retrieval
    """
    
    def __init__(self):
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index_name = settings.pinecone_index_name
        self._index = None
    
    def _get_index(self):
        """Get or create the Pinecone index"""
        if self._index is None:
            # Check if index exists
            existing_indexes = [idx.name for idx in self.pc.list_indexes()]
            
            if self.index_name not in existing_indexes:
                logger.info(f"Creating Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=settings.embedding_dimension,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=settings.pinecone_environment
                    )
                )
            
            self._index = self.pc.Index(self.index_name)
            logger.info(f"Connected to Pinecone index: {self.index_name}")
        
        return self._index
    
    async def upsert_chunk_vector(
        self,
        doc_id: str,
        doc_name: str,
        chunk_index: int,
        chunk_text: str,
        page_num: int,
        embedding: List[float]
    ) -> bool:
        """
        Store a text chunk embedding with metadata
        
        Args:
            doc_id: Unique document identifier
            doc_name: Original document name
            chunk_index: Index of the chunk in the document
            chunk_text: The actual text content of the chunk
            page_num: Page number where chunk starts
            embedding: Vector embedding from FastEmbed
        
        Returns:
            Success status
        """
        try:
            index = self._get_index()
            
            # Create unique vector ID
            vector_id = f"{doc_id}_chunk_{chunk_index}"
            
            # Metadata for retrieval and display
            # Note: Pinecone has metadata size limits, truncate text if needed
            truncated_text = chunk_text[:1000] if len(chunk_text) > 1000 else chunk_text
            
            metadata = {
                "doc_id": doc_id,
                "doc_name": doc_name,
                "chunk_index": chunk_index,
                "chunk_text": truncated_text,
                "page_num": page_num,
                "indexed_at": datetime.utcnow().isoformat(),
                "content_type": "text_chunk"
            }
            
            # Upsert to Pinecone
            index.upsert(
                vectors=[{
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                }]
            )
            
            logger.debug(f"Stored vector for {vector_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing vector: {str(e)}")
            raise
    
    async def upsert_chunk_vectors_batch(
        self,
        doc_id: str,
        doc_name: str,
        chunk_data: List[tuple]  # List of (chunk_index, chunk_text, page_num, embedding)
    ) -> bool:
        """
        Store multiple chunk embeddings in batch
        More efficient for processing entire documents
        
        Args:
            doc_id: Unique document identifier
            doc_name: Original document name
            chunk_data: List of (chunk_index, chunk_text, page_num, embedding) tuples
        """
        try:
            index = self._get_index()
            
            vectors = []
            for chunk_index, chunk_text, page_num, embedding in chunk_data:
                vector_id = f"{doc_id}_chunk_{chunk_index}"
                
                # Truncate text for metadata storage
                truncated_text = chunk_text[:1000] if len(chunk_text) > 1000 else chunk_text
                
                metadata = {
                    "doc_id": doc_id,
                    "doc_name": doc_name,
                    "chunk_index": chunk_index,
                    "chunk_text": truncated_text,
                    "page_num": page_num,
                    "indexed_at": datetime.utcnow().isoformat(),
                    "content_type": "text_chunk"
                }
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # Upsert in batches of 100 (Pinecone limit)
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                index.upsert(vectors=batch)
                logger.info(f"Upserted batch {i//batch_size + 1}/{(len(vectors) + batch_size - 1)//batch_size}")
            
            logger.info(f"Stored {len(vectors)} chunk vectors for document {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error in batch upsert: {str(e)}")
            raise
    
    async def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        doc_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar text chunks
        
        Args:
            query_embedding: Query vector from FastEmbed
            top_k: Number of results to return
            doc_ids: Optional filter by specific documents
        
        Returns:
            List of matching chunks with metadata and scores
        """
        try:
            index = self._get_index()
            
            # Build filter if doc_ids specified
            filter_dict = None
            if doc_ids:
                filter_dict = {"doc_id": {"$in": doc_ids}}
            
            # Query Pinecone
            results = index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            matches = []
            for match in results.matches:
                matches.append({
                    "vector_id": match.id,
                    "score": float(match.score),
                    "doc_id": match.metadata.get("doc_id"),
                    "doc_name": match.metadata.get("doc_name"),
                    "chunk_index": match.metadata.get("chunk_index"),
                    "chunk_text": match.metadata.get("chunk_text"),
                    "page_num": match.metadata.get("page_num"),
                    "indexed_at": match.metadata.get("indexed_at")
                })
            
            logger.info(f"Found {len(matches)} similar chunks")
            return matches
            
        except Exception as e:
            logger.error(f"Error in similarity search: {str(e)}")
            raise
    
    async def delete_document_vectors(self, doc_id: str) -> bool:
        """
        Delete all vectors for a document
        
        Args:
            doc_id: Document identifier
        """
        try:
            index = self._get_index()
            
            # Delete by metadata filter
            index.delete(
                filter={"doc_id": {"$eq": doc_id}}
            )
            
            logger.info(f"Deleted vectors for document {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting vectors: {str(e)}")
            raise
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        try:
            index = self._get_index()
            stats = index.describe_index_stats()
            return {
                "total_vectors": stats.total_vector_count,
                "dimension": stats.dimension,
                "namespaces": dict(stats.namespaces) if stats.namespaces else {}
            }
        except Exception as e:
            logger.error(f"Error getting stats: {str(e)}")
            return {}


# Singleton instance
vector_store = VectorStore()
