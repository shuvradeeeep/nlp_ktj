"""
PDF Processing Service
Handles PDF storage, text extraction, and chunking for RAG pipeline
"""

import os
import io
import base64
import logging
from pathlib import Path
from typing import List, Optional, Tuple
from dataclasses import dataclass
import fitz  # PyMuPDF

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class TextChunk:
    """Represents a text chunk from a document"""
    text: str
    chunk_index: int
    page_num: int  # Page where chunk starts
    start_char: int  # Character position in full document


class PDFService:
    """
    PDF Service with Text Extraction and Chunking
    Extracts text from PDFs and splits into overlapping chunks for embedding
    """
    
    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.chunk_size = settings.chunk_size
        self.chunk_overlap = settings.chunk_overlap
    
    def get_pdf_path(self, doc_id: str) -> Path:
        """Get the path for a stored PDF"""
        return self.upload_dir / f"{doc_id}.pdf"
    
    async def save_pdf(self, doc_id: str, file_content: bytes, original_name: str) -> Tuple[str, int]:
        """
        Save uploaded PDF to local storage
        Returns: (file_path, page_count)
        """
        try:
            pdf_path = self.get_pdf_path(doc_id)
            
            # Save the PDF file
            with open(pdf_path, "wb") as f:
                f.write(file_content)
            
            # Get page count
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            doc.close()
            
            # Store metadata
            metadata_path = self.upload_dir / f"{doc_id}.meta"
            with open(metadata_path, "w") as f:
                f.write(f"{original_name}\n{page_count}")
            
            logger.info(f"Saved PDF {original_name} with {page_count} pages as {doc_id}")
            return str(pdf_path), page_count
            
        except Exception as e:
            logger.error(f"Error saving PDF: {str(e)}")
            raise
    
    def get_document_metadata(self, doc_id: str) -> Optional[dict]:
        """Get stored document metadata"""
        metadata_path = self.upload_dir / f"{doc_id}.meta"
        if not metadata_path.exists():
            return None
        
        with open(metadata_path, "r") as f:
            lines = f.readlines()
            return {
                "original_name": lines[0].strip(),
                "page_count": int(lines[1].strip())
            }
    
    def list_documents(self) -> List[dict]:
        """List all stored documents"""
        documents = []
        for meta_file in self.upload_dir.glob("*.meta"):
            doc_id = meta_file.stem
            metadata = self.get_document_metadata(doc_id)
            if metadata:
                pdf_path = self.get_pdf_path(doc_id)
                if pdf_path.exists():
                    stat = pdf_path.stat()
                    documents.append({
                        "id": doc_id,
                        "name": metadata["original_name"],
                        "pages": metadata["page_count"],
                        "size": self._format_size(stat.st_size),
                        "created_at": stat.st_ctime
                    })
        return documents
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document and its metadata"""
        try:
            pdf_path = self.get_pdf_path(doc_id)
            metadata_path = self.upload_dir / f"{doc_id}.meta"
            
            if pdf_path.exists():
                pdf_path.unlink()
            if metadata_path.exists():
                metadata_path.unlink()
            
            logger.info(f"Deleted document {doc_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting document {doc_id}: {str(e)}")
            return False
    
    async def extract_text(self, doc_id: str) -> Tuple[str, List[Tuple[int, int]]]:
        """
        Extract all text from a PDF document
        
        Returns:
            Tuple of (full_text, page_boundaries)
            page_boundaries: List of (page_num, start_char_index) tuples
        """
        try:
            pdf_path = self.get_pdf_path(doc_id)
            if not pdf_path.exists():
                logger.error(f"PDF not found: {doc_id}")
                return "", []
            
            doc = fitz.open(pdf_path)
            full_text = ""
            page_boundaries = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_boundaries.append((page_num + 1, len(full_text)))  # 1-indexed
                
                # Extract text from page
                page_text = page.get_text("text")
                full_text += page_text
                
                # Add page separator if not ending with newline
                if page_text and not page_text.endswith("\n"):
                    full_text += "\n"
            
            doc.close()
            logger.info(f"Extracted {len(full_text)} characters from {doc_id}")
            return full_text, page_boundaries
            
        except Exception as e:
            logger.error(f"Error extracting text from {doc_id}: {str(e)}")
            return "", []
    
    def chunk_text(self, text: str, page_boundaries: List[Tuple[int, int]]) -> List[TextChunk]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Full document text
            page_boundaries: List of (page_num, start_char) tuples
        
        Returns:
            List of TextChunk objects
        """
        if not text:
            return []
        
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            # Calculate end position
            end = start + self.chunk_size
            
            # Try to break at sentence boundary if possible
            if end < len(text):
                # Look for sentence endings near the chunk boundary
                search_start = max(end - 50, start)
                search_text = text[search_start:end + 50] if end + 50 < len(text) else text[search_start:]
                
                # Find best break point (period, question mark, exclamation)
                best_break = -1
                for sep in ['. ', '? ', '! ', '\n\n', '\n']:
                    pos = search_text.rfind(sep)
                    if pos != -1:
                        actual_pos = search_start + pos + len(sep)
                        if actual_pos > start and actual_pos <= end + 50:
                            best_break = actual_pos
                            break
                
                if best_break > start:
                    end = best_break
            
            # Ensure we don't go past the end
            end = min(end, len(text))
            
            # Extract chunk text
            chunk_text = text[start:end].strip()
            
            if chunk_text:  # Only add non-empty chunks
                # Determine which page this chunk starts on
                page_num = 1
                for pn, char_start in page_boundaries:
                    if start >= char_start:
                        page_num = pn
                    else:
                        break
                
                chunks.append(TextChunk(
                    text=chunk_text,
                    chunk_index=chunk_index,
                    page_num=page_num,
                    start_char=start
                ))
                chunk_index += 1
            
            # Move start position with overlap
            start = end - self.chunk_overlap
            if start <= chunks[-1].start_char if chunks else 0:
                start = end  # Prevent infinite loop
        
        logger.info(f"Created {len(chunks)} chunks from text")
        return chunks
    
    async def extract_and_chunk(self, doc_id: str) -> List[TextChunk]:
        """
        Extract text from PDF and split into chunks
        Main method for document processing pipeline
        
        Args:
            doc_id: Document identifier
        
        Returns:
            List of TextChunk objects ready for embedding
        """
        text, page_boundaries = await self.extract_text(doc_id)
        if not text:
            return []
        
        chunks = self.chunk_text(text, page_boundaries)
        return chunks
    
    async def render_page_to_base64(self, doc_id: str, page_num: int, dpi: int = 100) -> Optional[str]:
        """
        Render page to base64 encoded PNG string (for frontend display)
        """
        try:
            pdf_path = self.get_pdf_path(doc_id)
            if not pdf_path.exists():
                return None
            
            doc = fitz.open(pdf_path)
            
            if page_num < 1 or page_num > len(doc):
                doc.close()
                return None
            
            page = doc[page_num - 1]
            zoom = dpi / 72
            matrix = fitz.Matrix(zoom, zoom)
            pixmap = page.get_pixmap(matrix=matrix)
            
            img_data = pixmap.tobytes("png")
            base64_str = base64.b64encode(img_data).decode("utf-8")
            
            doc.close()
            return base64_str
            
        except Exception as e:
            logger.error(f"Error rendering page {page_num} of {doc_id}: {str(e)}")
            return None
    
    def _format_size(self, size_bytes: int) -> str:
        """Format file size for display"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.1f} MB"


# Singleton instance
pdf_service = PDFService()
