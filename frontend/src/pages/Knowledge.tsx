import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileUploadZone } from "@/components/knowledge/FileUploadZone";
import { DocumentCard, Document } from "@/components/knowledge/DocumentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid3X3, List, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, ProcessingStatus } from "@/lib/api";

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingDocs, setProcessingDocs] = useState<Map<string, ProcessingStatus>>(new Map());
  const { toast } = useToast();

  // Load documents on mount
  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.listDocuments();
      setDocuments(response.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        date: new Date(doc.created_at).toLocaleDateString(),
        status: doc.status === 'ready' ? 'ready' : 
                doc.status === 'failed' ? 'failed' : 'processing',
        pages: doc.pages,
      })));
    } catch (error) {
      console.error("Failed to load documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents. Is the backend running?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Handle file upload
  const handleFileUpload = async (file: File, onProgress: (status: ProcessingStatus) => void) => {
    try {
      // Upload file
      const uploadResponse = await api.uploadDocument(file);
      
      toast({
        title: "Upload Started",
        description: `Processing ${file.name}...`,
      });

      // Add to documents list immediately
      const newDoc: Document = {
        id: uploadResponse.doc_id,
        name: uploadResponse.name,
        size: formatSize(file.size),
        date: "Just now",
        status: "processing",
        pages: 0,
      };
      setDocuments(prev => [newDoc, ...prev]);

      // Poll for status updates
      await api.pollDocumentStatus(
        uploadResponse.doc_id,
        (status) => {
          onProgress(status);
          setProcessingDocs(prev => new Map(prev).set(status.doc_id, status));
          
          // Update document in list
          setDocuments(prev => prev.map(doc => 
            doc.id === status.doc_id 
              ? { 
                  ...doc, 
                  status: status.status === 'ready' ? 'ready' : 
                          status.status === 'failed' ? 'failed' : 'processing',
                  pages: status.total_pages || doc.pages 
                }
              : doc
          ));
        }
      );

      toast({
        title: "Success!",
        description: `${file.name} has been indexed and is ready for chat.`,
      });

    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Handle document deletion
  const handleDelete = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast({
        title: "Deleted",
        description: "Document has been removed.",
      });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Handle view document
  const handleView = (docId: string) => {
    // Navigate to chat with this document selected
    window.location.href = `/chat?doc=${docId}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="mt-2 text-muted-foreground">
            Upload and manage your documents for AI-powered search and analysis.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="mb-8">
          <FileUploadZone onUpload={handleFileUpload} />
        </div>

        {/* Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Documents</h2>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={loadDocuments}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="flex rounded-lg border border-border">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && documents.length === 0 && (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading documents...</p>
            </div>
          )}

          {/* Documents Grid/List */}
          {!isLoading && (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              }
            >
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  processingStatus={processingDocs.get(doc.id)}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {documents.length === 0 
                  ? "No documents uploaded yet. Upload a PDF to get started!"
                  : "No documents found matching your search."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
