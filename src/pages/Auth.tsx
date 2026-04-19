import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">((params.get("mode") as any) || "login");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const redirectTo = params.get("redirect") || "/account";

  useEffect(() => {
    if (!authLoading && user) navigate(redirectTo, { replace: true });
  }, [user, authLoading, navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: parsed.data.full_name },
          },
        });
        if (error) {
          if (error.message.includes("already registered")) toast.error("This email is already registered. Please log in instead.");
          else toast.error(error.message);
          return;
        }
        toast.success("Account created! Please check your email to verify.");
      } else {
        const parsed = loginSchema.safeParse({ email: form.email, password: form.password });
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          if (error.message.includes("Invalid login credentials")) toast.error("Wrong email or password.");
          else if (error.message.includes("Email not confirmed")) toast.error("Please verify your email first.");
          else toast.error(error.message);
          return;
        }
        toast.success("Welcome back!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}${redirectTo}`,
      });
      if (result.error) { toast.error("Google sign-in failed. Please try again."); setOauthLoading(false); return; }
      if (result.redirected) return; // browser will redirect
    } catch {
      toast.error("Google sign-in failed.");
      setOauthLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!form.email) { toast.error("Please enter your email first."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-6"
        >
          <div className="text-center mb-10">
            <div className="h-[2px] w-8 bg-accent mx-auto mb-4" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Customer</p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-3">
              {mode === "login" ? "Sign in to access your orders & saved info" : "Join ATTIRE for a faster checkout experience"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={oauthLoading || submitting}
            className="w-full border border-border bg-background hover:bg-secondary/60 transition-colors py-3.5 flex items-center justify-center gap-3 text-sm font-body font-medium disabled:opacity-50"
          >
            {oauthLoading ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Full name"
                  className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                  maxLength={100}
                  required
                />
              </div>
            )}
            <div className="relative group">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                maxLength={255}
                autoComplete="email"
                required
              />
            </div>
            <div className="relative group">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                maxLength={72}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={6}
              />
            </div>

            {mode === "login" && (
              <button
                type="button"
                onClick={handleForgot}
                className="text-[11px] text-muted-foreground hover:text-accent transition-colors font-body tracking-wider uppercase"
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              disabled={submitting || oauthLoading}
              className="w-full bg-foreground text-primary-foreground py-4 font-display font-bold text-sm tracking-wider uppercase hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-body mt-8">
            {mode === "login" ? "New customer? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-foreground font-semibold hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-[11px] text-muted-foreground/70 font-body mt-6">
            <Link to="/" className="hover:text-accent transition-colors">← Continue as guest</Link>
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
