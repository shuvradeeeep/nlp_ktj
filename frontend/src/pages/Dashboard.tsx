import { useState, useEffect } from "react";
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
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

// --- SIMULATED INTENT RECOGNITION (Mimicking Pydantic Logic) ---
// In a real setup, this logic resides in your Python backend using Pydantic models.
type IntentType = "RETRIEVAL" | "ACTION" | "CLARIFY";

interface IntentResult {
  query: string;
  intent: IntentType;
  confidence: number;
}

const recognizeIntent = (query: string): IntentResult => {
  const q = query.toLowerCase();
  if (q.includes("schedule") || q.includes("find") || q.includes("call")) {
    return { query, intent: "ACTION", confidence: 0.98 };
  }
  if (q.length < 3) return { query, intent: "CLARIFY", confidence: 1.0 };
  return { query, intent: "RETRIEVAL", confidence: 0.85 };
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<IntentResult | null>(null);

  // Stats State (Persistence Layer)
  const [stats, setStats] = useState([
    { title: "Documents", value: "0", change: "No data", icon: FileText },
    { title: "Conversations", value: "0", change: "In-memory", icon: MessageSquare },
    { title: "Agent Actions", value: "0", change: "Ready", icon: Zap },
    { title: "Avg Response", value: "0ms", change: "N/A", icon: TrendingUp },
  ]);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Initialize data from LocalStorage
  useEffect(() => {
    const docs = JSON.parse(localStorage.getItem("nexus_docs") || "[]");
    const chats = JSON.parse(localStorage.getItem("nexus_chats") || "[]");
    const actions = JSON.parse(localStorage.getItem("nexus_actions") || "[]");
    const logs = JSON.parse(localStorage.getItem("nexus_activity_log") || "[]");

    setStats([
      { title: "Documents", value: docs.length.toString(), change: `+${docs.length} total`, icon: FileText },
      { title: "Conversations", value: chats.length.toString(), change: "Local Session", icon: MessageSquare },
      { title: "Agent Actions", value: actions.length.toString(), change: "Action Engine Ready", icon: Zap },
      { title: "Avg Response", value: "1.2s", change: "Optimal", icon: TrendingUp },
    ]);

    setRecentActivities(logs.slice(0, 4));
  }, []);

  // Handle Intent Recognition Demo
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length > 2) {
      setDetectedIntent(recognizeIntent(val));
    } else {
      setDetectedIntent(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Nexus Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Monitoring the Agentic Assistant's activity and visual reasoning.
            </p>
          </div>
          
          {/* Intent Recognition Sandbox */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Test Intent Recognition..." 
              className="pl-10"
              value={searchQuery}
              onChange={handleSearch}
            />
            {detectedIntent && (
              <div className="absolute top-full mt-2 w-full glass-card p-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="flex justify-between">
                  <span className="font-bold">Detected Intent:</span>
                  <Badge variant="outline" className="scale-75 origin-right">
                    {detectedIntent.intent}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-1">Confidence: {(detectedIntent.confidence * 100).toFixed(0)}%</div>
              </div>
            )}
          </div>
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
              <CardTitle>Activity Log</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-secondary/50">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.target}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge variant={activity.status === "success" ? "ready" : "processing"}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No activity found. Go to Knowledge Base to start.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated">
            <CardHeader><CardTitle>Nexus Operations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link to="/knowledge">
                <Button variant="outline" className="w-full justify-start h-auto py-4 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors mr-4">
                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">HCLTech Document Center</p>
                    <p className="text-xs text-muted-foreground">Index reports with Pixel Analysis</p>
                  </div>
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="outline" className="w-full justify-start h-auto py-4 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors mr-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Visual Reasoning Chat</p>
                    <p className="text-xs text-muted-foreground">Analyze charts and tables in real-time</p>
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