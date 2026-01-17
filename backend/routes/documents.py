"""
Document Routes
Handles file upload, listing, and management
Text-optimized processing pipeline
"""

import os
import uuid
import asyncio
import logging
from typing import Dict
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from models import (
    DocumentStatus, DocumentInfo, DocumentListResponse, 
    UploadResponse, ProcessingStatus, DeleteDocumentRequest
)
from services.pdf_service import pdf_service
from services.embedding_service import embedding_service
from services.vector_store import vector_store
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
router = APIRouter(prefix="/documents", tags=["Documents"])

# In-memory status tracking (use Redis in production)
processing_status: Dict[str, ProcessingStatus] = {}


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a PDF document for processing
    
    The document will be:
    1. Saved locally
    2. Text extracted and chunked (with overlap)
    3. Chunks embedded using FastEmbed
    4. Stored in Pinecone vector database
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Check file size
        content = await file.read()
        file_size = len(content)
        max_size = settings.max_file_size_mb * 1024 * 1024
        
        if file_size > max_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size is {settings.max_file_size_mb}MB"
            )
        
        # Generate unique document ID
        doc_id = str(uuid.uuid4())
        
        # Initialize processing status
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.UPLOADING,
            progress=0,
            message="Starting upload..."
        )
        
        # Save the PDF
        pdf_path, page_count = await pdf_service.save_pdf(doc_id, content, file.filename)
        
        # Update status
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.PROCESSING,
            progress=10,
            total_pages=page_count,
            message=f"PDF saved. Extracting text from {page_count} pages..."
        )
        
        # Start background processing
        background_tasks.add_task(
            process_document,
            doc_id,
            file.filename,
            page_count
        )
        
        return UploadResponse(
            doc_id=doc_id,
            name=file.filename,
            status=DocumentStatus.PROCESSING,
            message=f"Upload successful. Processing {page_count} pages..."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


async def process_document(doc_id: str, doc_name: str, page_count: int):
    """
    Background task to process document through text-based RAG pipeline
    1. Extract text from PDF
    2. Chunk text with overlap
    3. Embed chunks using FastEmbed
    4. Store in Pinecone
    """
    try:
        logger.info(f"Starting processing for document {doc_id}: {doc_name}")
        
        # Step 1: Extract and chunk text
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.PROCESSING,
            progress=20,
            total_pages=page_count,
            message="Extracting text from PDF..."
        )
        
        chunks = await pdf_service.extract_and_chunk(doc_id)
        
        if not chunks:
            processing_status[doc_id] = ProcessingStatus(
                doc_id=doc_id,
                status=DocumentStatus.FAILED,
                progress=0,
                message="Failed to extract text from PDF"
            )
            return
        
        logger.info(f"Extracted {len(chunks)} chunks from {doc_name}")
        
        # Step 2: Embed chunks
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.EMBEDDING,
            progress=40,
            total_pages=page_count,
            message=f"Embedding {len(chunks)} text chunks..."
        )
        
        # Get all chunk texts for batch embedding
        chunk_texts = [chunk.text for chunk in chunks]
        
        try:
            embeddings = await embedding_service.embed_texts_batch(chunk_texts)
        except Exception as e:
            logger.error(f"Error embedding chunks: {str(e)}")
            processing_status[doc_id] = ProcessingStatus(
                doc_id=doc_id,
                status=DocumentStatus.FAILED,
                progress=0,
                message=f"Failed to generate embeddings: {str(e)}"
            )
            return
        
        # Update progress
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.EMBEDDING,
            progress=70,
            total_pages=page_count,
            message="Embeddings generated. Storing in database..."
        )
        
        # Step 3: Prepare chunk data for batch upsert
        chunk_data = []
        for chunk, embedding in zip(chunks, embeddings):
            chunk_data.append((
                chunk.chunk_index,
                chunk.text,
                chunk.page_num,
                embedding
            ))
        
        # Step 4: Store in Pinecone
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.INDEXED,
            progress=85,
            total_pages=page_count,
            message="Storing vectors in database..."
        )
        
        await vector_store.upsert_chunk_vectors_batch(doc_id, doc_name, chunk_data)
        
        # Mark as ready
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.READY,
            progress=100,
            total_pages=page_count,
            message=f"Successfully indexed {len(chunks)} text chunks!"
        )
        
        logger.info(f"Successfully processed document {doc_id}: {len(chunks)} chunks indexed")
        
    except Exception as e:
        logger.error(f"Processing error for {doc_id}: {str(e)}")
        processing_status[doc_id] = ProcessingStatus(
            doc_id=doc_id,
            status=DocumentStatus.FAILED,
            progress=0,
            message=f"Processing failed: {str(e)}"
        )


@router.get("/status/{doc_id}", response_model=ProcessingStatus)
async def get_processing_status(doc_id: str):
    """Get the processing status of a document"""
    if doc_id not in processing_status:
        # Check if document exists and is ready
        metadata = pdf_service.get_document_metadata(doc_id)
        if metadata:
            return ProcessingStatus(
                doc_id=doc_id,
                status=DocumentStatus.READY,
                progress=100,
                total_pages=metadata["page_count"],
                message="Document is ready"
            )
        raise HTTPException(status_code=404, detail="Document not found")
    
    return processing_status[doc_id]


@router.get("/", response_model=DocumentListResponse)
async def list_documents():
    """List all uploaded documents"""
    try:
        docs = pdf_service.list_documents()
        
        documents = []
        for doc in docs:
            # Get status
            status = DocumentStatus.READY
            if doc["id"] in processing_status:
                status = processing_status[doc["id"]].status
            
            documents.append(DocumentInfo(
                id=doc["id"],
                name=doc["name"],
                size=doc["size"],
                pages=doc["pages"],
                status=status,
                created_at=datetime.fromtimestamp(doc["created_at"])
            ))
        
        return DocumentListResponse(
            documents=documents,
            total=len(documents)
        )
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")


@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document and its vectors"""
    try:
        # Delete from vector store
        await vector_store.delete_document_vectors(doc_id)
        
        # Delete PDF file
        deleted = pdf_service.delete_document(doc_id)
        
        # Remove from status tracking
        if doc_id in processing_status:
            del processing_status[doc_id]
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document deleted successfully", "doc_id": doc_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@router.get("/{doc_id}/page/{page_num}")
async def get_page_image(doc_id: str, page_num: int):
    """Get a specific page as base64 image"""
    try:
        base64_image = await pdf_service.render_page_to_base64(doc_id, page_num)
        
        if not base64_image:
            raise HTTPException(status_code=404, detail="Page not found")
        
        return {
            "doc_id": doc_id,
            "page_num": page_num,
            "image": f"data:image/png;base64,{base64_image}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting page image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get page: {str(e)}")
