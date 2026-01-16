import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  LogOut,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { title: "Chat", href: "/chat", icon: MessageSquare },
  { title: "Agent Actions", href: "/actions", icon: Zap },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <span className="text-sm font-bold text-primary-foreground">N</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">Nexus</span>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <span className="text-sm font-bold text-primary-foreground">N</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="ml-3">Log out</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
