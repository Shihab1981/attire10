import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const emptyForm = { code: "", type: "percent" as "percent" | "flat", value: 0, active: true, expires_at: "" };

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from("coupons").insert({
        code: data.code.toUpperCase().trim(),
        type: data.type,
        value: data.value,
        active: data.active,
        expires_at: data.expires_at || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success("Coupon created");
    },
    onError: () => toast.error("Failed to create coupon (code may already exist)"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
    },
  });

  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Coupons</h1>
          <button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-sm font-display font-semibold tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors">
            <Plus size={16} /> Add Coupon
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 font-display font-semibold">Code</th>
                  <th className="p-3 font-display font-semibold">Type</th>
                  <th className="p-3 font-display font-semibold">Value</th>
                  <th className="p-3 font-display font-semibold">Status</th>
                  <th className="p-3 font-display font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="p-3 font-medium font-mono">{c.code}</td>
                    <td className="p-3 text-muted-foreground capitalize">{c.type}</td>
                    <td className="p-3">{c.type === "percent" ? `${c.value}%` : `৳${c.value}`}</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleActive.mutate({ id: c.id, active: !c.active })}
                        className={`text-xs font-medium px-2 py-0.5 cursor-pointer ${c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {c.active ? "Active" : "Expired"}
                      </button>
                    </td>
                    <td className="p-3">
                      <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 hover:text-destructive transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">New Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm uppercase" required maxLength={20} placeholder="e.g. SUMMER20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "flat" })} className="w-full border border-border px-3 py-2 bg-background text-sm">
                    <option value="percent">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value *</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" required min={1} />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="w-full bg-foreground text-background py-3 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
                {createMutation.isPending ? "Creating..." : "Create Coupon"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminCoupons;
