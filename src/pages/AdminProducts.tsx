import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const categoryOptions = ["t-shirts", "panjabi", "polo-shirts", "pants", "trousers"];
const sizeOptions = ["S", "M", "L", "XL", "XXL"];

const emptyForm = {
  name: "", category: "t-shirts", sub_category: "", price: 0, original_price: null as number | null,
  image_url: "/placeholder.svg", sizes: ["S", "M", "L", "XL", "XXL"] as string[],
  fabric: "", description: "", trending: false, new_arrival: false, in_stock: true,
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editingId) {
        const { error } = await supabase.from("products").update(data).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success(editingId ? "Product updated" : "Product created");
    },
    onError: () => toast.error("Failed to save product"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
  });

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, category: p.category, sub_category: p.sub_category,
      price: p.price, original_price: p.original_price, image_url: p.image_url,
      sizes: p.sizes, fabric: p.fabric, description: p.description,
      trending: p.trending, new_arrival: p.new_arrival, in_stock: p.in_stock,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const toggleSize = (s: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }));
  };

  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <button onClick={openNew} className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-sm font-display font-semibold tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-3 font-display font-semibold">Name</th>
                  <th className="p-3 font-display font-semibold">Category</th>
                  <th className="p-3 font-display font-semibold">Price</th>
                  <th className="p-3 font-display font-semibold">Stock</th>
                  <th className="p-3 font-display font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-muted-foreground capitalize">{p.category.replace("-", " ")}</td>
                    <td className="p-3">৳{p.price.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-xs font-medium px-2 py-0.5 ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:text-accent transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => deleteMutation.mutate(p.id)} className="p-1.5 hover:text-destructive transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" required maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm">
                    {categoryOptions.map((c) => <option key={c} value={c}>{c.replace("-", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sub-category</label>
                  <input value={form.sub_category} onChange={(e) => setForm({ ...form, sub_category: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" maxLength={100} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (৳) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" required min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Original Price</label>
                  <input type="number" value={form.original_price ?? ""} onChange={(e) => setForm({ ...form, original_price: e.target.value ? +e.target.value : null })} className="w-full border border-border px-3 py-2 bg-background text-sm" min={0} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" maxLength={500} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sizes</label>
                <div className="flex gap-2">
                  {sizeOptions.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSize(s)} className={`w-10 h-10 text-xs font-medium border transition-colors ${form.sizes.includes(s) ? "border-foreground bg-foreground text-background" : "border-border"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fabric</label>
                <input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" maxLength={200} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm min-h-[80px] resize-none" maxLength={1000} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.trending} onChange={(e) => setForm({ ...form, trending: e.target.checked })} /> Trending
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.new_arrival} onChange={(e) => setForm({ ...form, new_arrival: e.target.checked })} /> New Arrival
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} /> In Stock
                </label>
              </div>
              <button type="submit" disabled={saveMutation.isPending} className="w-full bg-foreground text-background py-3 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminProducts;
