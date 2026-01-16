import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CommandPalette } from "@/components/actions/CommandPalette";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Mail,
  Users,
  Search,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const actions = [
  {
    id: "1",
    title: "Schedule HR Meet",
    description: "Schedule a meeting with HR team member",
    icon: Calendar,
    category: "Calendar",
    usageCount: 24,
  },
  {
    id: "2",
    title: "Send Email",
    description: "Compose and send professional emails",
    icon: Mail,
    category: "Email",
    usageCount: 156,
  },
  {
    id: "3",
    title: "Find Contact",
    description: "Search company directory",
    icon: Users,
    category: "Directory",
    usageCount: 42,
  },
  {
    id: "4",
    title: "Search Documents",
    description: "Query knowledge base",
    icon: Search,
    category: "Knowledge",
    usageCount: 89,
  },
];

const recentExecutions = [
  {
    id: "1",
    action: "Schedule HR Meet",
    target: "Meeting with Sarah - Performance Review",
    status: "success",
    time: "10 minutes ago",
  },
  {
    id: "2",
    action: "Send Email",
    target: "Project Update to Engineering Team",
    status: "success",
    time: "1 hour ago",
  },
  {
    id: "3",
    action: "Find Contact",
    target: "Search: Marketing Manager",
    status: "success",
    time: "2 hours ago",
  },
  {
    id: "4",
    action: "Schedule HR Meet",
    target: "Team sync - Q1 Planning",
    status: "failed",
    time: "3 hours ago",
  },
  {
    id: "5",
    action: "Send Email",
    target: "Client Proposal Draft",
    status: "pending",
    time: "Just now",
  },
];

export default function Actions() {
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="ready">Completed</Badge>;
      case "failed":
        return <Badge variant="failed">Failed</Badge>;
      case "pending":
        return <Badge variant="processing">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Agent Actions</h1>
            <p className="mt-2 text-muted-foreground">
              Execute automated workflows and manage agent capabilities.
            </p>
          </div>
          <Button variant="gradient" onClick={() => setShowCommandPalette(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Action
          </Button>
        </div>

        {/* Available Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Available Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => (
              <Card
                key={action.id}
                variant="elevated"
                className="group cursor-pointer hover:border-primary/30"
                onClick={() => setShowCommandPalette(true)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                      <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {action.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Used {action.usageCount} times
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Executions */}
        <Card variant="elevated">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Executions</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center gap-4 rounded-lg p-4 transition-colors hover:bg-secondary/50 border border-border"
                >
                  {getStatusIcon(execution.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{execution.action}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {execution.target}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {getStatusBadge(execution.status)}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {execution.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
      />
    </DashboardLayout>
  );
}
