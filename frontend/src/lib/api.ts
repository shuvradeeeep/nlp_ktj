/**
 * API Service for Nexus RAG Pipeline
 * Handles communication with FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface Document {
  id: string;
  name: string;
  size: string;
  pages: number;
  status: 'uploading' | 'processing' | 'embedding' | 'indexed' | 'ready' | 'failed';
  created_at: string;
  updated_at?: string;
}

export interface ProcessingStatus {
  doc_id: string;
  status: 'uploading' | 'processing' | 'embedding' | 'indexed' | 'ready' | 'failed';
  progress: number;
  current_page?: number;
  total_pages?: number;
  message: string;
}

export interface UploadResponse {
  doc_id: string;
  name: string;
  status: string;
  message: string;
}

export interface SourcePage {
  doc_id: string;
  doc_name: string;
  page_num: number;
  similarity_score: number;
  page_image_base64?: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourcePage[];
  query: string;
}

export interface PageImageResponse {
  doc_id: string;
  page_num: number;
  image: string; // data:image/png;base64,...
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Upload a PDF document
   */
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  /**
   * Get document processing status
   */
  async getDocumentStatus(docId: string): Promise<ProcessingStatus> {
    const response = await fetch(`${this.baseUrl}/documents/status/${docId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get status');
    }

    return response.json();
  }

  /**
   * Poll document status until complete
   */
  async pollDocumentStatus(
    docId: string,
    onProgress: (status: ProcessingStatus) => void,
    intervalMs: number = 1000
  ): Promise<ProcessingStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getDocumentStatus(docId);
          onProgress(status);
          
          if (status.status === 'ready' || status.status === 'failed') {
            resolve(status);
            return;
          }
          
          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }

  /**
   * List all documents
   */
  async listDocuments(): Promise<{ documents: Document[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/documents/`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to list documents');
    }

    return response.json();
  }

  /**
   * Delete a document
   */
  async deleteDocument(docId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/documents/${docId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete document');
    }
  }

  /**
   * Get a specific page image
   */
  async getPageImage(docId: string, pageNum: number): Promise<PageImageResponse> {
    const response = await fetch(`${this.baseUrl}/documents/${docId}/page/${pageNum}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get page');
    }

    return response.json();
  }

  /**
   * Chat with documents
   */
  async chat(query: string, topK: number = 3, docIds?: string[]): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        top_k: topK,
        doc_ids: docIds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Chat failed');
    }

    return response.json();
  }

  /**
   * Get document summary
   */
  async summarizeDocument(docId: string): Promise<{ doc_id: string; doc_name: string; summary: string }> {
    const response = await fetch(`${this.baseUrl}/chat/summarize/${docId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Summarization failed');
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

// Export singleton instance
export const api = new ApiService();

// Export class for custom instances
export { ApiService };
