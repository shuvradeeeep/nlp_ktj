import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Mail,
  Users,
  Search,
  ArrowRight,
  CheckCircle,
  Loader2,
  Clock,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

const commands: Command[] = [
  {
    id: "schedule-hr",
    title: "Schedule HR Meet",
    description: "Schedule a meeting with HR team",
    icon: Calendar,
    category: "Calendar",
  },
  {
    id: "send-email",
    title: "Send Email",
    description: "Compose and send an email",
    icon: Mail,
    category: "Email",
  },
  {
    id: "find-contact",
    title: "Find Contact",
    description: "Search for a contact in the directory",
    icon: Users,
    category: "Directory",
  },
  {
    id: "search-docs",
    title: "Search Documents",
    description: "Search through knowledge base",
    icon: Search,
    category: "Knowledge",
  },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LogEntry {
  id: string;
  message: string;
  status: "pending" | "success" | "error";
  timestamp: Date;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [formData, setFormData] = useState({
    recipient: "",
    time: "",
    purpose: "",
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCommandSelect = (command: Command) => {
    setSelectedCommand(command);
    setSearch("");
  };

  const handleConfirm = async () => {
    setShowConfirmation(true);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setLogs([]);

    // Simulate agent execution with logs
    const addLog = (message: string, status: "pending" | "success" | "error") => {
      setLogs((prev) => [
        ...prev,
        { id: Math.random().toString(), message, status, timestamp: new Date() },
      ]);
    };

    addLog("Initializing agent...", "pending");
    await new Promise((r) => setTimeout(r, 500));
    setLogs((prev) =>
      prev.map((l, i) => (i === 0 ? { ...l, status: "success" as const } : l))
    );

    addLog(`Parsing parameters: ${formData.recipient}`, "pending");
    await new Promise((r) => setTimeout(r, 700));
    setLogs((prev) =>
      prev.map((l, i) => (i === 1 ? { ...l, status: "success" as const } : l))
    );

    addLog("Executing: Google Calendar API...", "pending");
    await new Promise((r) => setTimeout(r, 1000));
    setLogs((prev) =>
      prev.map((l, i) => (i === 2 ? { ...l, status: "success" as const } : l))
    );

    addLog("Action completed successfully!", "success");

    await new Promise((r) => setTimeout(r, 500));
    setIsExecuting(false);
  };

  const handleClose = () => {
    setSelectedCommand(null);
    setShowConfirmation(false);
    setLogs([]);
    setFormData({ recipient: "", time: "", purpose: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-card border-border">
        {!selectedCommand ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  className="pl-10 border-0 bg-secondary/50 focus-visible:ring-0"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={() => handleCommandSelect(command)}
                  className="w-full flex items-center gap-4 rounded-lg p-3 text-left transition-colors hover:bg-secondary group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                    <command.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{command.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {command.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {command.category}
                  </Badge>
                </button>
              ))}
            </div>
          </>
        ) : !showConfirmation ? (
          <>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                  <selectedCommand.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                {selectedCommand.title}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  value={formData.recipient}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient: e.target.value })
                  }
                  placeholder="e.g., Sarah from HR"
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Textarea
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  placeholder="Brief description of the meeting purpose..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCommand(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleConfirm}
                  className="flex-1"
                  disabled={!formData.recipient || !formData.time}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-3">
                {isExecuting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : logs.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <Clock className="h-5 w-5 text-warning" />
                )}
                {isExecuting
                  ? "Executing Action..."
                  : logs.length > 0
                  ? "Action Complete"
                  : "Confirm Action"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0 space-y-4">
              {/* Confirmation Card */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-sm font-medium mb-3">Agent will perform:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    📧 Sending meeting invite to{" "}
                    <span className="text-foreground font-medium">
                      {formData.recipient}
                    </span>
                  </p>
                  <p>
                    📅 Scheduled for{" "}
                    <span className="text-foreground font-medium">
                      {new Date(formData.time).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    📝 Purpose:{" "}
                    <span className="text-foreground font-medium">
                      {formData.purpose || "Not specified"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Live Logs */}
              {logs.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-4 font-mono text-xs">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    <Terminal className="h-4 w-4" />
                    <span>Agent Logs</span>
                  </div>
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 animate-slide-in-up"
                      >
                        {log.status === "pending" && (
                          <Loader2 className="h-3 w-3 mt-0.5 animate-spin text-primary" />
                        )}
                        {log.status === "success" && (
                          <CheckCircle className="h-3 w-3 mt-0.5 text-success" />
                        )}
                        <span
                          className={cn(
                            log.status === "success" && "text-success",
                            log.status === "pending" && "text-muted-foreground"
                          )}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isExecuting && logs.length === 0 && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleExecute}
                    className="flex-1"
                  >
                    Execute Action
                  </Button>
                </div>
              )}

              {logs.length > 0 && !isExecuting && (
                <Button variant="outline" onClick={handleClose} className="w-full">
                  Close
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
