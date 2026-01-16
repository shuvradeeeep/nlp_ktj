import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  FileText,
  Maximize2,
} from "lucide-react";

interface PDFViewerProps {
  documentName?: string;
  currentPage?: number;
  totalPages?: number;
  highlightedSection?: string;
  onClose?: () => void;
}

export function PDFViewer({
  documentName = "Document.pdf",
  currentPage = 1,
  totalPages = 12,
  highlightedSection,
  onClose,
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(currentPage);

  return (
    <Card variant="elevated" className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm">{documentName}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col">
        {/* PDF Preview Area */}
        <div className="flex-1 rounded-lg border border-border bg-secondary/30 flex items-center justify-center relative overflow-hidden">
          {highlightedSection && (
            <Badge
              variant="outline"
              className="absolute top-4 left-4 border-primary/50 bg-primary/10 text-primary"
            >
              Highlighted: {highlightedSection}
            </Badge>
          )}
          
          {/* Simulated PDF content */}
          <div
            className="w-full max-w-md p-8 bg-card rounded-lg shadow-elevated transition-transform"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div className="space-y-4">
              <div className="h-6 bg-secondary rounded animate-shimmer" />
              <div className="h-4 bg-secondary rounded w-5/6" />
              <div className="h-4 bg-secondary rounded w-4/6" />
              <div className="h-20 bg-secondary/50 rounded border border-border" />
              <div className="h-4 bg-secondary rounded" />
              <div className="h-4 bg-secondary rounded w-5/6" />
              <div className="h-4 bg-secondary rounded w-3/6" />
              {highlightedSection && (
                <div className="p-3 rounded bg-primary/10 border border-primary/30">
                  <div className="h-4 bg-primary/20 rounded w-full" />
                  <div className="h-4 bg-primary/20 rounded w-4/5 mt-2" />
                </div>
              )}
              <div className="h-4 bg-secondary rounded" />
              <div className="h-4 bg-secondary rounded w-4/6" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
