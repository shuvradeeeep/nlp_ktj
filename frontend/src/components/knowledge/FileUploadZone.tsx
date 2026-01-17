import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProcessingStatus } from "@/lib/api";

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "processing" | "embedding" | "indexed" | "complete" | "error";
  message?: string;
}

interface FileUploadZoneProps {
  onUpload?: (file: File, onProgress: (status: ProcessingStatus) => void) => Promise<void>;
}

export function FileUploadZone({ onUpload }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      const errorFile: UploadingFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        progress: 0,
        status: "error",
        message: "Only PDF files are supported",
      };
      setUploadingFiles((prev) => [...prev, errorFile]);
      return;
    }

    const uploadFile: UploadingFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 5,
      status: "uploading",
      message: "Starting upload...",
    };

    setUploadingFiles((prev) => [...prev, uploadFile]);

    if (onUpload) {
      try {
        await onUpload(file, (status: ProcessingStatus) => {
          setUploadingFiles((prev) =>
            prev.map((f) => {
              if (f.name === file.name) {
                let displayStatus: UploadingFile["status"] = "processing";
                if (status.status === "ready") displayStatus = "complete";
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
          prev.map((f) => {
            if (f.name === file.name) {
              return {
                ...f,
                status: "error",
                message: error instanceof Error ? error.message : "Upload failed",
              };
            }
            return f;
          })
        );
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, [onUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
    // Reset input
    e.target.value = '';
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
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing PDF...";
      case "embedding":
        return "Generating embeddings...";
      case "indexed":
        return "Storing in vector database...";
      case "complete":
        return "Ready for chat!";
      case "error":
        return "Failed";
      default:
        return "";
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
          <p className="text-lg font-medium">Drop PDF files here or click to upload</p>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF files up to 50MB each
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border bg-card p-4 animate-slide-in-up",
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
                  "text-xs mt-1",
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
