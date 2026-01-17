"""
Nexus - Multimodal RAG Pipeline Backend
FastAPI application with modular architecture
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import get_settings
from routes import documents_router, chat_router
from services.vector_store import vector_store

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    # Startup
    logger.info("Starting Nexus RAG Pipeline...")
    logger.info(f"Upload directory: {settings.upload_dir}")
    
    # Initialize vector store connection
    try:
        stats = await vector_store.get_index_stats()
        logger.info(f"Connected to Pinecone. Vectors: {stats.get('total_vectors', 0)}")
    except Exception as e:
        logger.warning(f"Could not connect to Pinecone on startup: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Nexus RAG Pipeline...")


# Initialize FastAPI app
app = FastAPI(
    title="Nexus - Multimodal RAG Pipeline",
    description="""
    A multimodal RAG (Retrieval-Augmented Generation) system for PDF document analysis.
    
    ## Features
    - **PDF Upload**: Upload and process PDF documents
    - **Multimodal Embedding**: Uses Voyage AI for visual embeddings
    - **Vector Search**: Pinecone for semantic similarity search
    - **Visual QA**: Google Gemini for multimodal reasoning
    - **Just-In-Time Rendering**: Pages rendered on demand, no image storage
    
    ## Architecture
    1. Upload PDF → Store locally
    2. Convert pages to images → Embed with Voyage AI
    3. Store vectors in Pinecone with metadata
    4. Query → Retrieve similar pages → Render JIT → Gemini reasoning
    """,
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://127.0.0.1:5173", 
        "http://localhost:8080", 
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Nexus Multimodal RAG Pipeline",
        "version": "2.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        stats = await vector_store.get_index_stats()
        pinecone_status = True
    except:
        stats = {}
        pinecone_status = False
    
    return {
        "status": "healthy",
        "version": "2.0.0",
        "services": {
            "pinecone": pinecone_status,
            "voyage_ai": True,  # Will fail on actual call if misconfigured
            "gemini": True
        },
        "vector_store": stats
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
