import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileUploadZone } from "@/components/knowledge/FileUploadZone";
import { DocumentCard, Document } from "@/components/knowledge/DocumentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid3X3, List, RefreshCw, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, ProcessingStatus } from "@/lib/api"; // From backend branch

export default function Knowledge() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingDocs, setProcessingDocs] = useState<Map<string, ProcessingStatus>>(new Map());

  // --- REFRESH LOGIC: Fetch from real backend ---
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
        title: "Backend Connection Error",
        description: "Could not fetch artifacts. Ensure the FastAPI server is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // --- UPLOAD LOGIC: Bridge between UI and Backend API ---
  const handleFileUpload = async (file: File, onProgress: (status: ProcessingStatus) => void) => {
    try {
      const uploadResponse = await api.uploadDocument(file);
      
      toast({
        title: "Nexus Indexing Started",
        description: `Analyzing ${file.name} for visual reasoning...`,
      });

      // Add to local UI state immediately
      const newDoc: Document = {
        id: uploadResponse.doc_id,
        name: uploadResponse.name,
        size: formatSize(file.size),
        date: "Just now",
        status: "processing",
        pages: 0,
      };
      setDocuments(prev => [newDoc, ...prev]);

      // Poll the backend for Pixel-Level processing status
      await api.pollDocumentStatus(
        uploadResponse.doc_id,
        (status) => {
          onProgress(status);
          setProcessingDocs(prev => new Map(prev).set(status.doc_id, status));
          
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
        description: `${file.name} is now indexed and ready for chat.`,
      });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Nexus could not process this PDF.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // --- DELETE LOGIC: Removes from Backend and updates Dashboard logs ---
  const handleDelete = async (docId: string) => {
    try {
      const docToDelete = documents.find(d => d.id === docId);
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));

      // --- NEXUS PERSISTENCE: Update Dashboard Activity Log ---
      const logs = JSON.parse(localStorage.getItem("nexus_activity_log") || "[]");
      logs.unshift({
        id: Date.now(),
        action: "Artifact Deleted",
        target: docToDelete?.name || "Unknown",
        time: "Just now",
        status: "success"
      });
      localStorage.setItem("nexus_activity_log", JSON.stringify(logs.slice(0, 10)));
      window.dispatchEvent(new Event("storage"));

      toast({
        title: "Artifact Removed",
        description: "Deleted from the Nexus local index.",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not remove the document from the server.",
        variant: "destructive",
      });
    }
  };

  const handleView = (docId: string) => {
    // Navigates to the reasoning chat with specific doc selected
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
        {/* Header - Aligned with Nexus Pixel-Level Strategy */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Knowledge Base</h1>
            <p className="mt-2 text-muted-foreground">
              Manage indexed artifacts using Pixel-Level Analysis for visual integrity.
            </p>
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2 flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{documents.length} Artifacts Indexed</span>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="mb-8">
          <FileUploadZone onUpload={handleFileUpload} />
        </div>

        {/* Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Artifacts</h2>
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
                  placeholder="Search indexed reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none border-r"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-none"
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
              <p className="mt-2 text-muted-foreground">Initializing Nexus index...</p>
            </div>
          )}

          {/* Dynamic Documents List */}
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
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <Database className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No artifacts found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                {documents.length === 0 
                  ? "Upload the HCLTech Annual Report to begin the real-time 'Chat with PDF' test."
                  : "No artifacts found matching your search."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}