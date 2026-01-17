import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface UploadingFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
}

export function FileUploadZone() {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const simulateUpload = (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    const newFile: UploadingFile = {
      id: fileId,
      name: file.name,
      size: formatSize(file.size),
      progress: 0,
      status: "uploading",
    };

    setUploadingFiles((prev) => [...prev, newFile]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: Math.min(currentProgress, 100) } : f))
      );

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // --- NEXUS PERSISTENCE LAYER ---
        // 1. Save to the main document registry for the Knowledge page
        const existingDocs = JSON.parse(localStorage.getItem("nexus_docs") || "[]");
        const docEntry = {
          id: fileId,
          name: file.name,
          size: newFile.size,
          date: "Just now",
          status: "ready",
          pages: Math.floor(Math.random() * 40) + 10,
          indexingType: "Pixel-Level (Nexus)" // Matches strategy in
        };
        localStorage.setItem("nexus_docs", JSON.stringify([docEntry, ...existingDocs]));

        // 2. Record activity for the Dashboard activity log
        const logs = JSON.parse(localStorage.getItem("nexus_activity_log") || "[]");
        logs.unshift({
          id: Date.now(),
          action: "Document Indexed",
          target: file.name,
          time: "Just now",
          status: "success"
        });
        localStorage.setItem("nexus_activity_log", JSON.stringify(logs.slice(0, 10)));

        // 3. Dispatch storage event to trigger re-renders in parent pages
        window.dispatchEvent(new Event("storage"));

        toast({
          title: "Nexus Indexing Successful",
          description: `${file.name} processed with Pixel-Level Analysis.`,
        });

        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "complete" } : f))
        );
      }
    }, 250);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(simulateUpload);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(simulateUpload);
  };

  const removeFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
        )}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div
            className={cn(
              "mb-4 rounded-full p-4 transition-colors",
              isDragging ? "bg-primary/20" : "bg-secondary"
            )}
          >
            <Upload className={cn("h-8 w-8", isDragging ? "text-primary" : "text-muted-foreground")} />
          </div>
          <p className="text-lg font-medium">Upload HCLTech Annual Reports</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Nexus strategy: Pixel-Level Indexing to preserve visual integrity
          </p>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-in slide-in-from-bottom-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {file.size}
                  </span>
                </div>
                <div className="mt-2">
                  <Progress value={file.progress} className="h-1" />
                </div>
              </div>
              <div className="shrink-0">
                {file.status === "complete" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}