import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Documents",
    value: "24",
    change: "+3 this week",
    icon: FileText,
    trend: "up",
  },
  {
    title: "Conversations",
    value: "156",
    change: "+12 today",
    icon: MessageSquare,
    trend: "up",
  },
  {
    title: "Agent Actions",
    value: "89",
    change: "+5 this week",
    icon: Zap,
    trend: "up",
  },
  {
    title: "Avg Response",
    value: "1.2s",
    change: "-0.3s",
    icon: TrendingUp,
    trend: "up",
  },
];

const recentActivities = [
  {
    id: 1,
    action: "Document indexed",
    target: "Q4_Financial_Report.pdf",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    action: "Chat completed",
    target: "Analysis of marketing budget",
    time: "15 minutes ago",
    status: "success",
  },
  {
    id: 3,
    action: "Agent action",
    target: "Scheduled HR meeting",
    time: "1 hour ago",
    status: "success",
  },
  {
    id: 4,
    action: "Document processing",
    target: "Technical_Spec_v2.docx",
    time: "2 hours ago",
    status: "processing",
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back. Here's what's happening with your knowledge base.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} variant="elevated" className="group hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                    <stat.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-semibold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                </div>
                <p className="mt-3 text-xs text-success">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card variant="elevated">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.target}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge
                        variant={
                          activity.status === "success" ? "ready" : "processing"
                        }
                      >
                        {activity.status}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/knowledge">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors mr-4">
                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Upload Documents</p>
                    <p className="text-xs text-muted-foreground">
                      Add new PDFs to your knowledge base
                    </p>
                  </div>
                </Button>
              </Link>
              <Link to="/chat">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors mr-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Start New Chat</p>
                    <p className="text-xs text-muted-foreground">
                      Query your documents with AI
                    </p>
                  </div>
                </Button>
              </Link>
              <Link to="/actions">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors mr-4">
                    <Zap className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Execute Agent Action</p>
                    <p className="text-xs text-muted-foreground">
                      Run automated workflows
                    </p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
