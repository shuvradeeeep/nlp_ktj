import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "complete" | "error";
}

export function FileUploadZone() {
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

  const simulateUpload = (file: File) => {
    const uploadFile: UploadingFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
    };

    setUploadingFiles((prev) => [...prev, uploadFile]);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadingFiles((prev) =>
        prev.map((f) => {
          if (f.id === uploadFile.id) {
            const newProgress = Math.min(f.progress + 10, 100);
            return {
              ...f,
              progress: newProgress,
              status: newProgress === 100 ? "complete" : "uploading",
            };
          }
          return f;
        })
      );
    }, 200);

    setTimeout(() => clearInterval(interval), 2200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(simulateUpload);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(simulateUpload);
  };

  const removeFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
          accept=".pdf,.doc,.docx,.txt"
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
          <p className="text-lg font-medium">Drop files here or click to upload</p>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF, DOC, DOCX, TXT up to 50MB each
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 animate-slide-in-up"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatSize(file.size)}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
