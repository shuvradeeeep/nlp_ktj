import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

interface AuthCardProps {
  onGoogleSuccess: (response: CredentialResponse) => void;
  onGoogleError: () => void;
}

export function AuthCard({ 
  onGoogleSuccess, 
  onGoogleError 
}: AuthCardProps) {
  return (
    <Card variant="elevated" className="w-full max-w-md animate-fade-up">
      <CardHeader className="text-center">
        {/* Branding Logo */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
          <span className="text-xl font-bold text-primary-foreground">N</span>
        </div>
        <CardTitle className="text-2xl">Nexus Intelligence</CardTitle>
        <CardDescription>
          Sign in to access your AI-powered knowledge platform
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-6 pb-8">
        <div className="text-sm text-muted-foreground text-center">
          For security, please use your authorized enterprise account.
        </div>

        {/* Exclusive Google Login Integration */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            useOneTap
            theme="outline"
            shape="pill"
            width="320px"
          />
        </div>

        <div className="text-[10px] text-muted-foreground text-center max-w-[280px]">
          By continuing, you are accessing the secure Kshitij 2026 NLP Challenge sandbox environment.
        </div>
      </CardContent>
    </Card>
  );
}