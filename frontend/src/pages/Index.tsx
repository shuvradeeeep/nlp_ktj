import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Knowledge Management",
    description:
      "Upload and index PDFs, documents, and files. Our AI understands your content deeply.",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Chat",
    description:
      "Ask questions in natural language and get precise answers with source citations.",
  },
  {
    icon: Zap,
    title: "Agent Actions",
    description:
      "Automate workflows like scheduling meetings, sending emails, and more.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant with end-to-end encryption and role-based access control.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track usage, measure ROI, and optimize your knowledge base performance.",
  },
  {
    icon: Globe,
    title: "Integrations",
    description:
      "Connect with Google Workspace, Slack, and your favorite productivity tools.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0v60h60V0zM1 1h58v58H1V1z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <span className="text-sm font-bold text-primary-foreground">N</span>
              </div>
              <span className="font-semibold text-lg">Nexus Intelligence</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button variant="gradient">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32 text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 text-primary">
            <Sparkles className="mr-1 h-3 w-3" />
            Now with GPT-4 Turbo
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            Your Knowledge,{" "}
            <span className="text-gradient">Supercharged</span>{" "}
            with AI
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload documents, ask questions, execute actions. Nexus Intelligence 
            transforms your knowledge base into an intelligent AI assistant.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button variant="gradient" size="xl">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="xl">
              Watch Demo
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to unlock your knowledge
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern teams who want to work smarter, not harder.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-glow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <div className="relative rounded-2xl border border-border bg-card/50 p-12 md:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to transform your knowledge base?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Join thousands of teams already using Nexus Intelligence to work smarter.
              </p>
              <div className="mt-8">
                <Link to="/auth">
                  <Button variant="gradient" size="xl">
                    Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <span className="text-xs font-bold text-primary-foreground">N</span>
                </div>
                <span className="font-semibold">Nexus Intelligence</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 Nexus Intelligence. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
