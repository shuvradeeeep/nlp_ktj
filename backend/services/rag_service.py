"""
RAG Service with Google Gemini via LangChain
Text-optimized RAG pipeline with FastEmbed and Pinecone
"""

import logging
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv()

from config import get_settings
from .pdf_service import pdf_service
from .embedding_service import embedding_service
from .vector_store import vector_store

logger = logging.getLogger(__name__)
settings = get_settings()


class RAGService:
    """
    RAG Service combining retrieval and generation
    Uses FastEmbed for text embeddings and Gemini (via LangChain) for answer generation
    """
    
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")
        
        self.model = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.3
        )
        logger.info("Gemini model initialized via LangChain")
    
    async def process_query(
        self,
        query: str,
        top_k: int = 5,
        doc_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Complete RAG pipeline:
        1. Embed query using FastEmbed
        2. Search Pinecone for relevant text chunks
        3. Send chunks to Gemini for answer generation
        
        Args:
            query: User's question
            top_k: Number of chunks to retrieve
            doc_ids: Optional filter by documents
        
        Returns:
            Answer with sources
        """
        try:
            # Step 1: Embed the query
            logger.info(f"Processing query: {query[:50]}...")
            query_embedding = await embedding_service.embed_query(query)
            
            # Step 2: Retrieve relevant chunks
            matches = await vector_store.similarity_search(
                query_embedding=query_embedding,
                top_k=top_k,
                doc_ids=doc_ids
            )
            
            if not matches:
                return {
                    "answer": "I couldn't find any relevant information in the uploaded documents. Please make sure you have uploaded documents and try again.",
                    "sources": [],
                    "query": query
                }
            
            # Step 3: Prepare sources with chunk text
            sources = []
            context_chunks = []
            
            for match in matches:
                chunk_text = match.get("chunk_text", "")
                context_chunks.append({
                    "text": chunk_text,
                    "doc_name": match["doc_name"],
                    "page_num": match["page_num"],
                    "score": match["score"]
                })
                
                sources.append({
                    "doc_id": match["doc_id"],
                    "doc_name": match["doc_name"],
                    "page_num": match["page_num"],
                    "chunk_index": match.get("chunk_index", 0),
                    "chunk_text": chunk_text,
                    "similarity_score": match["score"]
                })
            
            # Step 4: Generate answer using Gemini
            answer = await self._generate_answer(query, context_chunks)
            
            return {
                "answer": answer,
                "sources": sources,
                "query": query
            }
            
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {str(e)}")
            raise
    
    async def _generate_answer(
        self,
        query: str,
        context_chunks: List[Dict]
    ) -> str:
        """
        Generate answer using Gemini with retrieved context
        
        Args:
            query: User's question
            context_chunks: List of relevant text chunks with metadata
        
        Returns:
            Generated answer string
        """
        try:
            # Build context from chunks
            context_parts = []
            for i, chunk in enumerate(context_chunks, 1):
                context_parts.append(
                    f"[Source {i}: {chunk['doc_name']}, Page {chunk['page_num']}]\n{chunk['text']}"
                )
            
            context_text = "\n\n---\n\n".join(context_parts)
            
            prompt = f"""You are an intelligent document assistant. Answer the user's question based on the provided context from their documents.

Question: {query}

Context from documents:
{context_text}

Instructions:
1. Answer based ONLY on the information provided in the context above
2. If the context doesn't contain enough information to fully answer, say so
3. Cite your sources by mentioning which document and page the information comes from
4. Be concise but thorough
5. If multiple sources contain relevant information, synthesize them

Answer:"""

            # Generate response using LangChain
            response = self.model.invoke([HumanMessage(content=prompt)])
            
            answer = response.content
            logger.info(f"Generated answer with {len(answer)} characters")
            
            return answer
            
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return f"I encountered an error while analyzing the documents: {str(e)}"
    
    async def summarize_document(self, doc_id: str) -> str:
        """
        Generate a summary of an entire document
        
        Args:
            doc_id: Document identifier
        
        Returns:
            Document summary
        """
        try:
            # Extract text from document
            chunks = await pdf_service.extract_and_chunk(doc_id)
            
            if not chunks:
                return "Could not load document for summarization."
            
            metadata = pdf_service.get_document_metadata(doc_id)
            doc_name = metadata["original_name"] if metadata else "Unknown Document"
            
            # Use first chunks for summary (limit to avoid token limits)
            summary_text = "\n\n".join([chunk.text for chunk in chunks[:10]])
            
            prompt = f"""Please provide a comprehensive summary of this document: "{doc_name}"

Document content (first sections):
{summary_text}

Provide:
1. Main topic/subject of the document
2. Key points or findings
3. Type of document (report, manual, presentation, etc.)
4. Any notable sections or data mentioned

Summary:"""

            response = self.model.invoke([HumanMessage(content=prompt)])
            
            return response.content
            
        except Exception as e:
            logger.error(f"Error summarizing document: {str(e)}")
            return f"Error generating summary: {str(e)}"


# Singleton instance
rag_service = RAGService()
