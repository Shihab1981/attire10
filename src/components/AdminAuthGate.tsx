import { useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setAdminPassword, getAdminPassword } from "@/lib/adminApi";

interface AdminAuthGateProps {
  children: ReactNode;
}

const AdminAuthGate = ({ children }: AdminAuthGateProps) => {
  const [authenticated, setAuthenticated] = useState(() => !!getAdminPassword());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    // Verify against edge function (server-side password check).
    const { data, error: fnErr } = await supabase.functions.invoke("admin-api", {
      body: { action: "select", table: "site_settings", select: "key", password },
    });
    setChecking(false);
    if (fnErr || data?.error) {
      setError("Incorrect password");
      return;
    }
    setAdminPassword(password);
    setAuthenticated(true);
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8">
        <h1 className="font-display text-2xl font-bold mb-2">Admin Access</h1>
        <p className="text-muted-foreground text-sm mb-6">Enter the admin password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors mb-3"
          placeholder="Password"
          autoFocus
        />
        {error && <p className="text-destructive text-xs mb-3">{error}</p>}
        <button
          type="submit"
          disabled={checking}
          className="w-full bg-foreground text-background py-3 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
        >
          {checking ? "Checking..." : "Enter Dashboard"}
        </button>
      </form>
    </div>
  );
};

export default AdminAuthGate;
