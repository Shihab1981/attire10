import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, ImagePlus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useCategories } from "@/hooks/useCategories";

type Product = Tables<"products">;

const sizeOptions = ["S", "M", "L", "XL", "XXL"];

const presetColors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Navy", value: "#1B2A4A" },
  { name: "Grey", value: "#6B7280" },
  { name: "Olive", value: "#556B2F" },
  { name: "Maroon", value: "#800000" },
  { name: "Beige", value: "#D4C5A9" },
  { name: "Brown", value: "#8B4513" },
  { name: "Sky Blue", value: "#87CEEB" },
  { name: "Red", value: "#DC2626" },
  { name: "Teal", value: "#0D9488" },
  { name: "Cream", value: "#FFFDD0" },
];

const emptyForm = {
  name: "", category: "t-shirts", sub_category: "", price: 0, original_price: null as number | null,
  image_url: "/placeholder.svg", sizes: ["S", "M", "L", "XL", "XXL"] as string[],
  fabric: "", description: "", trending: false, new_arrival: false, in_stock: true,
  colors: [] as string[], images: [] as string[],
  color_images: {} as Record<string, string>,
  stock_quantity: 10,
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const { categorySlugs } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadingColorImage, setUploadingColorImage] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#000000");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      // First image becomes main, rest go to additional
      if (!form.image_url || form.image_url === "/placeholder.svg") {
        setForm((f) => ({
          ...f,
          image_url: urls[0],
          images: [...f.images, ...urls.slice(1)],
        }));
      } else {
        setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      }
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url: string, isMain: boolean) => {
    if (isMain) {
      // Promote first additional image to main, or reset
      const nextMain = form.images[0] || "/placeholder.svg";
      setForm((f) => ({
        ...f,
        image_url: nextMain,
        images: f.images.slice(1),
      }));
    } else {
      setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));
    }
  };

  const toggleColor = (color: string) => {
    setForm((f) => {
      const has = f.colors.includes(color);
      const newColorImages = { ...f.color_images };
      if (has) delete newColorImages[color];
      return {
        ...f,
        colors: has ? f.colors.filter((c) => c !== color) : [...f.colors, color],
        color_images: newColorImages,
      };
    });
  };

  const addCustomColor = () => {
    if (!form.colors.includes(customColor)) {
      setForm((f) => ({ ...f, colors: [...f.colors, customColor] }));
    }
  };

  const handleColorImageUpload = async (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingColorImage(color);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, color_images: { ...f.color_images, [color]: url } }));
      toast.success("Color image uploaded");
    } catch {
      toast.error("Failed to upload color image");
    } finally {
      setUploadingColorImage(null);
      e.target.value = "";
    }
  };

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
      colors: (p as any).colors ?? [], images: (p as any).images ?? [],
      color_images: (p as any).color_images ?? {},
      stock_quantity: (p as any).stock_quantity ?? 10,
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

  const allImages = [
    ...(form.image_url && form.image_url !== "/placeholder.svg" ? [form.image_url] : []),
    ...form.images,
  ];

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
                  <th className="p-3 font-display font-semibold">Image</th>
                  <th className="p-3 font-display font-semibold">Name</th>
                  <th className="p-3 font-display font-semibold">Category</th>
                  <th className="p-3 font-display font-semibold">Price</th>
                  <th className="p-3 font-display font-semibold">Colors</th>
                  <th className="p-3 font-display font-semibold">Stock</th>
                  <th className="p-3 font-display font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3">
                      <div className="w-10 h-10 bg-secondary overflow-hidden">
                        <img src={p.image_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-muted-foreground capitalize">{p.category.replace("-", " ")}</td>
                    <td className="p-3">৳{p.price.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {((p as any).colors ?? []).slice(0, 4).map((c: string) => (
                          <div key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} />
                        ))}
                        {((p as any).colors ?? []).length > 4 && (
                          <span className="text-[10px] text-muted-foreground">+{(p as any).colors.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 ${p.in_stock && (p as any).stock_quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.in_stock && (p as any).stock_quantity > 0 ? `${(p as any).stock_quantity ?? '∞'}` : "Out"}
                        </span>
                      </div>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" required maxLength={200} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm">
                    {categorySlugs.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
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

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="grid grid-cols-4 gap-3">
                  {/* Main image */}
                  {form.image_url && form.image_url !== "/placeholder.svg" && (
                    <div className="relative aspect-square bg-secondary overflow-hidden group">
                      <img src={form.image_url} alt="Main" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(form.image_url, true)}
                          className="opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground p-1 rounded-full transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 text-[8px] bg-foreground/80 text-background px-1.5 py-0.5 font-body">
                        MAIN
                      </span>
                    </div>
                  )}
                  {/* Additional images */}
                  {form.images.map((url) => (
                    <div key={url} className="relative aspect-square bg-secondary overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(url, false)}
                          className="opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground p-1 rounded-full transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Upload button */}
                  <label className="aspect-square border-2 border-dashed border-border hover:border-foreground/40 transition-colors flex flex-col items-center justify-center cursor-pointer">
                    {uploading ? (
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    ) : (
                      <>
                        <ImagePlus size={20} className="text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">Add Images</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  First image is the main product photo. Upload multiple images for gallery view.
                </p>
              </div>

              {/* Manual URL fallback */}
              <div>
                <label className="block text-sm font-medium mb-1">Or paste Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm" maxLength={500} placeholder="https://..." />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium mb-2">Colors</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetColors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleColor(c.value)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                        form.colors.includes(c.value) ? "border-foreground scale-110" : "border-border hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {form.colors.includes(c.value) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-[10px] font-bold ${c.value === "#FFFFFF" || c.value === "#FFFDD0" || c.value === "#D4C5A9" || c.value === "#87CEEB" ? "text-foreground" : "text-background"}`}>✓</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {/* Custom color */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 border border-border cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-body"
                  >
                    + Add custom color
                  </button>
                </div>
                {/* Selected colors with image upload */}
                {form.colors.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {form.colors.map((c) => {
                      const preset = presetColors.find((p) => p.value === c);
                      const colorImg = form.color_images[c];
                      return (
                        <div key={c} className="flex items-center gap-3 bg-secondary/50 border border-border p-2.5">
                          <span className="w-6 h-6 rounded-full border border-border shrink-0" style={{ backgroundColor: c }} />
                          <span className="text-xs font-body font-medium min-w-[60px]">{preset?.name || c}</span>
                          
                          {/* Color image */}
                          {colorImg ? (
                            <div className="relative w-10 h-10 bg-secondary overflow-hidden shrink-0">
                              <img src={colorImg} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setForm((f) => {
                                  const ci = { ...f.color_images };
                                  delete ci[c];
                                  return { ...f, color_images: ci };
                                })}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          ) : (
                            <label className="shrink-0 cursor-pointer">
                              <span className="text-[10px] text-accent hover:underline font-body">
                                {uploadingColorImage === c ? "Uploading..." : "+ Image"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleColorImageUpload(c, e)}
                                className="hidden"
                                disabled={uploadingColorImage === c}
                              />
                            </label>
                          )}

                          <button type="button" onClick={() => toggleColor(c)} className="ml-auto hover:text-destructive">
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
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
