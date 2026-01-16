import { useNavigate } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";

export default function Auth() {
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    console.log("Login:", { email, password });
    navigate("/dashboard");
  };

  const handleSignUp = (email: string, password: string, name: string) => {
    console.log("Sign up:", { email, password, name });
    navigate("/dashboard");
  };

  const handleGoogleAuth = () => {
    console.log("Google auth");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0v60h60V0zM1 1h58v58H1V1z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <AuthCard
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onGoogleAuth={handleGoogleAuth}
        />
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
