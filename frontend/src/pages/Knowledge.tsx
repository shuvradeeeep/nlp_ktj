import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileUploadZone } from "@/components/knowledge/FileUploadZone";
import { DocumentCard, Document } from "@/components/knowledge/DocumentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid3X3, List } from "lucide-react";

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Q4_Financial_Report_2024.pdf",
    size: "2.4 MB",
    date: "2 hours ago",
    status: "ready",
    pages: 48,
  },
  {
    id: "2",
    name: "Technical_Architecture_v3.pdf",
    size: "8.1 MB",
    date: "1 day ago",
    status: "ready",
    pages: 124,
  },
  {
    id: "3",
    name: "Marketing_Strategy_2025.pdf",
    size: "1.2 MB",
    date: "2 days ago",
    status: "processing",
    pages: 32,
  },
  {
    id: "4",
    name: "Employee_Handbook_v2.pdf",
    size: "3.7 MB",
    date: "1 week ago",
    status: "ready",
    pages: 86,
  },
  {
    id: "5",
    name: "Product_Roadmap_Q1.pdf",
    size: "956 KB",
    date: "1 week ago",
    status: "failed",
    pages: 18,
  },
  {
    id: "6",
    name: "Legal_Compliance_Guide.pdf",
    size: "4.2 MB",
    date: "2 weeks ago",
    status: "ready",
    pages: 156,
  },
];

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredDocuments = mockDocuments.filter((doc) =>
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

          {/* Documents Grid/List */}
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
                onView={(id) => console.log("View:", id)}
                onDelete={(id) => console.log("Delete:", id)}
              />
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No documents found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
