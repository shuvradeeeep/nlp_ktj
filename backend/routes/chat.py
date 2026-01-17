"""
Chat Routes
Handles RAG-based chat with documents
Text-optimized pipeline using FastEmbed
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException

from models import ChatRequest, ChatResponse, SourceChunk
from services.rag_service import rag_service
from services.pdf_service import pdf_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def chat_with_documents(request: ChatRequest):
    """
    Chat with uploaded documents using RAG
    
    Pipeline:
    1. Query embedded using FastEmbed
    2. Similar text chunks retrieved from Pinecone
    3. Gemini generates answer with text context
    """
    try:
        logger.info(f"Chat request: {request.query[:50]}...")
        
        # Process through RAG pipeline
        result = await rag_service.process_query(
            query=request.query,
            top_k=request.top_k,
            doc_ids=request.doc_ids
        )
        
        # Format sources for response
        sources = [
            SourceChunk(
                doc_id=s["doc_id"],
                doc_name=s["doc_name"],
                page_num=s["page_num"],
                chunk_index=s.get("chunk_index", 0),
                chunk_text=s.get("chunk_text", ""),
                similarity_score=s["similarity_score"]
            )
            for s in result["sources"]
        ]
        
        return ChatResponse(
            answer=result["answer"],
            sources=sources,
            query=result["query"]
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.post("/summarize/{doc_id}")
async def summarize_document(doc_id: str):
    """Generate a summary of a specific document"""
    try:
        # Verify document exists
        metadata = pdf_service.get_document_metadata(doc_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="Document not found")
        
        summary = await rag_service.summarize_document(doc_id)
        
        return {
            "doc_id": doc_id,
            "doc_name": metadata["original_name"],
            "summary": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@router.get("/documents")
async def get_available_documents():
    """Get list of documents available for chat"""
    try:
        docs = pdf_service.list_documents()
        return {
            "documents": [
                {
                    "id": doc["id"],
                    "name": doc["name"],
                    "pages": doc["pages"]
                }
                for doc in docs
            ]
        }
    except Exception as e:
        logger.error(f"Error getting documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
