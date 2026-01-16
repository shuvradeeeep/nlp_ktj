import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal, Eye, Trash2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  status: "processing" | "ready" | "failed";
  pages?: number;
}

interface DocumentCardProps {
  document: Document;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document, onView, onDelete }: DocumentCardProps) {
  const statusConfig = {
    processing: { variant: "processing" as const, label: "Processing" },
    ready: { variant: "ready" as const, label: "Ready" },
    failed: { variant: "failed" as const, label: "Failed" },
  };

  const { variant, label } = statusConfig[document.status];

  return (
    <Card variant="elevated" className="group hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
              <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                {document.name}
              </h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{document.size}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {document.date}
                </span>
                {document.pages && (
                  <>
                    <span>•</span>
                    <span>{document.pages} pages</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onView?.(document.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(document.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant={variant}>{label}</Badge>
          {document.status === "ready" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary"
              onClick={() => onView?.(document.id)}
            >
              Open in Chat →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
