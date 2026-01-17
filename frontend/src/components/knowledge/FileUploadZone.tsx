import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProcessingStatus } from "@/lib/api"; // From Backend branch
import { useToast } from "@/hooks/use-toast"; // From Sandeep branch

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "processing" | "embedding" | "indexed" | "complete" | "error";
  message?: string;
}

interface FileUploadZoneProps {
  // Added from backend branch to support real API calls
  onUpload?: (file: File, onProgress: (status: ProcessingStatus) => void) => Promise<void>;
}

export function FileUploadZone({ onUpload }: FileUploadZoneProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // --- PERSISTENCE UTILITY (Nexus Strategy) ---
  const recordNexusActivity = (fileName: string, fileSize: number) => {
    // 1. Update the main document registry for the Knowledge page/Dashboard
    const existingDocs = JSON.parse(localStorage.getItem("nexus_docs") || "[]");
    const docEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: fileName,
      size: formatSize(fileSize),
      date: "Just now",
      status: "ready",
      pages: Math.floor(Math.random() * 40) + 10,
      indexingType: "Pixel-Level (Nexus)" //
    };
    localStorage.setItem("nexus_docs", JSON.stringify([docEntry, ...existingDocs]));

    // 2. Record activity for the Dashboard activity log
    const logs = JSON.parse(localStorage.getItem("nexus_activity_log") || "[]");
    logs.unshift({
      id: Date.now(),
      action: "Document Indexed",
      target: fileName,
      time: "Just now",
      status: "success"
    });
    localStorage.setItem("nexus_activity_log", JSON.stringify(logs.slice(0, 10)));

    // 3. Dispatch storage event to trigger re-renders in Dashboard/Knowledge
    window.dispatchEvent(new Event("storage"));
  };

  const processFile = async (file: File) => {
    // PDF Validation from Backend branch
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Unsupported File",
        description: "Nexus requires PDF format for Pixel-Level Indexing.",
        variant: "destructive"
      });
      return;
    }

    const uploadFile: UploadingFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 5,
      status: "uploading",
      message: "Initializing Nexus upload...",
    };

    setUploadingFiles((prev) => [...prev, uploadFile]);

    if (onUpload) {
      try {
        await onUpload(file, (status: ProcessingStatus) => {
          setUploadingFiles((prev) =>
            prev.map((f) => {
              if (f.name === file.name) {
                let displayStatus: UploadingFile["status"] = "processing";
                
                // Transition logic for Backend statuses -> Sandeep UI
                if (status.status === "ready") {
                  displayStatus = "complete";
                  // --- NEXUS SYNC: Update Local Persistence when backend finishes ---
                  recordNexusActivity(file.name, file.size);
                }
                else if (status.status === "failed") displayStatus = "error";
                else if (status.status === "embedding") displayStatus = "embedding";
                else if (status.status === "indexed") displayStatus = "indexed";
                
                return {
                  ...f,
                  progress: status.progress,
                  status: displayStatus,
                  message: status.message,
                };
              }
              return f;
            })
          );
        });
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.name === file.name ? { ...f, status: "error", message: "Nexus Indexing Failed" } : f))
        );
      }
    }
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
    Array.from(e.dataTransfer.files).forEach(processFile);
  }, [onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(processFile);
    e.target.value = ''; // Reset input
  };

  const removeFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusIcon = (status: UploadingFile["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    }
  };

  const getStatusText = (file: UploadingFile) => {
    if (file.message) return file.message;
    switch (file.status) {
      case "embedding":
        return "Nexus: Generating visual embeddings...";
      case "indexed":
        return "Nexus: Storing in pixel-level vector index...";
      case "complete":
        return "Indexed and ready for visual reasoning!";
      case "error":
        return "Nexus Processing Failed";
      default:
        return file.status.charAt(0).toUpperCase() + file.status.slice(1) + "...";
    }
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
              className={cn(
                "flex items-center gap-4 rounded-lg border bg-card p-4 animate-in slide-in-from-bottom-2",
                file.status === "error" ? "border-destructive/50" : "border-border"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                file.status === "error" ? "bg-destructive/10" : "bg-secondary"
              )}>
                <FileText className={cn(
                  "h-5 w-5",
                  file.status === "error" ? "text-destructive" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </span>
                </div>
                <p className={cn(
                  "text-[10px] mt-1 font-mono",
                  file.status === "error" ? "text-destructive" : "text-muted-foreground"
                )}>
                  {getStatusText(file)}
                </p>
                {file.status !== "complete" && file.status !== "error" && (
                  <div className="mt-2">
                    <Progress value={file.progress} className="h-1" />
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {file.status === "complete" || file.status === "error" ? (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  getStatusIcon(file.status)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}