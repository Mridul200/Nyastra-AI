import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Auth() {
  const { enterAsGuest } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot_password">("login");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Using signInWithOtp ensures the Magic Link template (with {{ .Token }}) is sent
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: { shouldCreateUser: false }
      });
      if (error) throw error;
      toast.success("OTP sent! Please check your email.");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) throw error;
      setStep("password");
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setMode("login");
      setStep("email");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard"); // Redirect to dashboard on login
      } else if (mode === "signup") {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        if (data?.session) {
          toast.success("Account created! Welcome.");
          navigate("/dashboard");
        } else {
          toast.success("Account created! Please check your email to verify your account.");
        }
      }
    } catch (err: any) {
      console.error("Auth error details:", err);
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      toast.error(err.message || "Failed to initialize Google Sign In");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md card-gradient border-border">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">
            {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Sign in to access your legal workspace"
              : mode === "signup"
              ? "Join Nyastra AI today"
              : "We'll send you a link to reset your password"}
          </p>
        </CardHeader>
        <CardContent>
          {mode === "forgot_password" ? (
            step === "email" ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Verification Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="advocate@example.com"
                      className="pl-10 bg-secondary border-border text-foreground h-11"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            ) : step === "otp" ? (
              <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
                <div className="space-y-2 text-center w-full">
                  <Label className="text-sm text-muted-foreground">Enter 6-digit Code</Label>
                  <div className="flex justify-center py-2">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="w-10 h-12 bg-secondary border-border text-lg font-bold" />
                        <InputOTPSlot index={1} className="w-10 h-12 bg-secondary border-border text-lg font-bold" />
                        <InputOTPSlot index={2} className="w-10 h-12 bg-secondary border-border text-lg font-bold" />
                        <InputOTPSlot index={3} className="w-10 h-12 bg-secondary border-border text-lg font-bold" />
                        <InputOTPSlot index={4} className="w-10 h-12 bg-secondary border-border text-lg font-bold" />
                        <InputOTPSlot index={5} className="w-10 h-12 bg-secondary border-border text-lg font-bold" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 gap-2" disabled={loading || otp.length !== 6}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Code <ArrowRight className="w-4 h-4" /></>}
                </Button>
                <button type="button" onClick={() => setStep("email")} className="text-xs text-muted-foreground hover:text-primary underline">
                  Resend Email
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 bg-secondary border-border text-foreground h-11"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Update Password <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            )
          ) : (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-11 border-border/80 bg-secondary/40 hover:bg-secondary flex items-center justify-center gap-3 text-foreground font-medium transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px bg-border flex-1" />
                <span className="text-[11px] text-muted-foreground uppercase font-medium tracking-wider">
                  or continue with email
                </span>
                <div className="h-px bg-border flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 bg-secondary border-border text-foreground h-11"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advocate@example.com"
                    className="pl-10 bg-secondary border-border text-foreground h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground">Password</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot_password")}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-secondary border-border text-foreground h-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

          <div className="mt-6 text-center space-y-4 flex flex-col items-center">
            {mode === "forgot_password" ? (
              <button
                onClick={() => setMode("login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                type="button"
              >
                Back to Sign In
              </button>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  type="button"
                >
                  {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
                
                <div className="flex items-center gap-2 py-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Or test for now</span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-2"
                  onClick={() => {
                    enterAsGuest();
                    navigate("/dashboard");
                    toast.info("Entering Demo Mode (Guest)");
                  }}
                >
                  Enter as Guest <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
