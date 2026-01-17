# Nexus - Multimodal RAG Pipeline

A complete RAG (Retrieval-Augmented Generation) system for PDF document analysis using multimodal AI.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React + Vite)                    │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Knowledge   │    │     Chat     │    │    PDF Viewer        │  │
│  │   (Upload)    │    │   (Query)    │    │  (Page Display)      │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Backend (FastAPI)                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                         Routes                                │  │
│  │  /documents/upload  │  /documents/  │  /chat/  │  /health    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        Services                               │  │
│  │  PDFService  │  EmbeddingService  │  VectorStore  │  RAG     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  Voyage AI   │ │   Pinecone   │ │   Gemini     │
        │  (Embeddings)│ │  (Vectors)   │ │  (LLM)       │
        └──────────────┘ └──────────────┘ └──────────────┘
```

## Key Features

1. **Just-In-Time Page Rendering**: PDFs are stored locally, pages rendered on-demand (no S3 upload needed)
2. **Multimodal Embeddings**: Voyage AI creates visual embeddings for each page
3. **Visual QA**: Gemini analyzes actual page images for answers
4. **Real-time Status**: Upload progress tracking with status updates

## Pipeline Flow

### Ingestion (Upload)
1. User uploads PDF → Saved locally
2. Each page converted to image (PyMuPDF)
3. Each page embedded using Voyage AI multimodal
4. Vectors stored in Pinecone with metadata (page_num, doc_id, doc_name)

### Query (Chat)
1. User asks question
2. Query embedded using Voyage AI multimodal
3. Similar pages retrieved from Pinecone
4. Pages rendered just-in-time to images
5. Images sent to Gemini with question
6. Answer returned with page citations

## Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys
cp .env.example .env

# Run the server
python main.py
# or
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install
# or
bun install

# Run dev server
npm run dev
# or
bun dev
```

## Environment Variables

### Backend (.env)
```env
VOYAGE_API_KEY=your_voyage_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=nlp26
GOOGLE_API_KEY=your_google_api_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## API Endpoints

### Documents
- `POST /documents/upload` - Upload a PDF file
- `GET /documents/` - List all documents
- `GET /documents/status/{doc_id}` - Get processing status
- `DELETE /documents/{doc_id}` - Delete a document
- `GET /documents/{doc_id}/page/{page_num}` - Get page image

### Chat
- `POST /chat/` - Chat with documents
- `POST /chat/summarize/{doc_id}` - Summarize a document

## Project Structure

```
backend/
├── main.py              # FastAPI app
├── config.py            # Settings and configuration
├── models.py            # Pydantic models
├── requirements.txt     # Python dependencies
├── routes/
│   ├── documents.py     # Document management routes
│   └── chat.py          # Chat routes
└── services/
    ├── pdf_service.py       # PDF storage and rendering
    ├── embedding_service.py # Voyage AI embeddings
    ├── vector_store.py      # Pinecone operations
    └── rag_service.py       # RAG pipeline

frontend/
├── src/
│   ├── lib/
│   │   └── api.ts       # API client
│   ├── pages/
│   │   ├── Knowledge.tsx # Document upload page
│   │   └── Chat.tsx     # Chat interface
│   └── components/
│       ├── knowledge/
│       │   ├── FileUploadZone.tsx
│       │   └── DocumentCard.tsx
│       └── chat/
│           ├── ChatMessage.tsx
│           ├── ChatInput.tsx
│           └── PDFViewer.tsx
```

## Usage

1. Start the backend server: `python main.py` (runs on port 8000)
2. Start the frontend: `npm run dev` (runs on port 5173)
3. Go to `/knowledge` and upload PDF files
4. Wait for processing to complete (shows embedding progress)
5. Go to `/chat` and ask questions about your documents
6. Click citations to view the source pages
