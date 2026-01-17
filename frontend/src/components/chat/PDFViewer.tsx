import { useState, useEffect } from "react";
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
  ImageOff,
} from "lucide-react";

interface PDFViewerProps {
  documentName?: string;
  pageNumber?: number | null;
  totalPages?: number;
  highlightedSection?: string;
  pageImageData?: string | null;
  onClose?: () => void;
}

export function PDFViewer({
  documentName = "Document.pdf",
  pageNumber = null,
  totalPages = 1,
  highlightedSection,
  pageImageData,
  onClose,
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);

  return (
    <Card variant="elevated" className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm truncate max-w-[200px]">{documentName}</CardTitle>
            {pageNumber && (
              <p className="text-xs text-muted-foreground">
                Page {pageNumber} {totalPages > 1 ? `of ${totalPages}` : ''}
              </p>
            )}
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

      <CardContent className="flex-1 p-4 flex flex-col overflow-hidden">
        {/* PDF Preview Area */}
        <div className="flex-1 rounded-lg border border-border bg-secondary/30 flex items-center justify-center relative overflow-auto">
          {pageNumber && (
            <Badge
              variant="outline"
              className="absolute top-4 left-4 z-10 border-primary/50 bg-primary/10 text-primary"
            >
              Page {pageNumber}
            </Badge>
          )}
          
          {pageImageData ? (
            /* Actual page image from backend */
            <div 
              className="p-4 transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <img 
                src={pageImageData} 
                alt={`Page ${pageNumber} of ${documentName}`}
                className="max-w-full h-auto rounded shadow-lg"
                style={{ maxHeight: '80vh' }}
              />
            </div>
          ) : (
            /* Placeholder when no image */
            <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
              <ImageOff className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-sm font-medium">No page selected</p>
              <p className="text-xs mt-1">Ask a question to see relevant pages</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              disabled={!pageImageData}
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
              disabled={!pageImageData}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {pageNumber ? `Viewing Page ${pageNumber}` : 'No page selected'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
