import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-detects recovery hash in URL and creates a session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated successfully!");
    navigate("/account");
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
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground font-body mt-3">Enter your new password below</p>
          </div>

          {!ready ? (
            <p className="text-center text-sm text-muted-foreground font-body">
              Verifying reset link...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                  minLength={6}
                  maxLength={72}
                  required
                />
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
                  minLength={6}
                  maxLength={72}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-foreground text-primary-foreground py-4 font-display font-bold text-sm tracking-wider uppercase hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
              </button>
            </form>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
