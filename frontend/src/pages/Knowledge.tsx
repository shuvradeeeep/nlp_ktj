import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileUploadZone } from "@/components/knowledge/FileUploadZone";
import { DocumentCard, Document } from "@/components/knowledge/DocumentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid3X3, List, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Knowledge() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<Document[]>([]);

  // --- PERSISTENCE & SYNC LOGIC ---
  const loadDocuments = () => {
    // Fetches the actual indexed artifacts from the local Nexus store
    const storedDocs = JSON.parse(localStorage.getItem("nexus_docs") || "[]");
    setDocuments(storedDocs);
  };

  useEffect(() => {
    loadDocuments();
    // Synchronizes the list whenever a file is uploaded in the FileUploadZone
    window.addEventListener("storage", loadDocuments);
    return () => window.removeEventListener("storage", loadDocuments);
  }, []);

  const handleDelete = (id: string) => {
    const updatedDocs = documents.filter((doc) => doc.id !== id);
    localStorage.setItem("nexus_docs", JSON.stringify(updatedDocs));
    
    // Update the Dashboard Activity Log to reflect the deletion
    const logs = JSON.parse(localStorage.getItem("nexus_activity_log") || "[]");
    logs.unshift({
      id: Date.now(),
      action: "Artifact Deleted",
      target: documents.find(d => d.id === id)?.name || "Unknown",
      time: "Just now",
      status: "success"
    });
    localStorage.setItem("nexus_activity_log", JSON.stringify(logs.slice(0, 10)));
    
    setDocuments(updatedDocs);
    toast({
      title: "Artifact Removed",
      description: "The document has been deleted from the Nexus local index.",
    });
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
          <FileUploadZone />
        </div>

        {/* Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Documents</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search report sections..."
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

          {/* Dynamic Documents List */}
          {filteredDocuments.length > 0 ? (
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
                  onView={(id) => console.log("Nexus reasoning viewer for:", id)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <Database className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No artifacts found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                Upload the HCLTech Annual Report to begin the real-time "Chat with PDF" test.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}