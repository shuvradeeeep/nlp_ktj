import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-16 min-h-screen transition-all duration-300 lg:ml-60">
        <div className="bg-gradient-radial">
          {children}
        </div>
      </main>
    </div>
  );
}
