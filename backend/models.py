"""
Pydantic models for API requests and responses
Text-optimized RAG pipeline models
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class DocumentStatus(str, Enum):
    """Document processing status"""
    UPLOADING = "uploading"
    PROCESSING = "processing"
    EMBEDDING = "embedding"
    INDEXED = "indexed"
    READY = "ready"
    FAILED = "failed"


# Request Models
class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    query: str = Field(..., min_length=1, description="User's question")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of chunks to retrieve")
    doc_ids: Optional[List[str]] = Field(default=None, description="Filter by specific documents")


class DeleteDocumentRequest(BaseModel):
    """Request model for deleting a document"""
    doc_id: str


# Response Models
class SourceChunk(BaseModel):
    """Source chunk information in chat response"""
    doc_id: str
    doc_name: str
    page_num: int
    chunk_index: int
    chunk_text: str  # The actual text content
    similarity_score: float


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    answer: str
    sources: List[SourceChunk]
    query: str


class DocumentInfo(BaseModel):
    """Document information model"""
    id: str
    name: str
    size: str
    pages: int
    status: DocumentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None


class DocumentListResponse(BaseModel):
    """Response model for listing documents"""
    documents: List[DocumentInfo]
    total: int


class UploadResponse(BaseModel):
    """Response model for file upload"""
    doc_id: str
    name: str
    status: DocumentStatus
    message: str


class ProcessingStatus(BaseModel):
    """Real-time processing status"""
    doc_id: str
    status: DocumentStatus
    progress: int = Field(ge=0, le=100)
    current_page: Optional[int] = None
    total_pages: Optional[int] = None
    message: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    services: Dict[str, bool]
