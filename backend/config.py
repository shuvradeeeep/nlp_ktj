"""
Configuration module for Nexus RAG Pipeline
Handles environment variables and application settings
Text-Optimized version using FastEmbed
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Pinecone Configuration
    pinecone_api_key: str
    pinecone_environment: str = "us-east-1"
    pinecone_index_name: str = "nexus-text"
    
    # Google Gemini Configuration
    google_api_key: str
    
    # Application Settings
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 50
    allowed_extensions: list = [".pdf"]
    
    # Text Chunking Settings
    chunk_size: int = 512  # Characters per chunk
    chunk_overlap: int = 100  # Overlap between chunks
    
    # Vector Settings (FastEmbed BAAI/bge-small-en-v1.5 dimension)
    embedding_dimension: int = 384
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Create uploads directory if it doesn't exist
settings = get_settings()
os.makedirs(settings.upload_dir, exist_ok=True)
