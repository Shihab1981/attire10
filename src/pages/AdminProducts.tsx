import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminApi } from "@/lib/adminApi";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X, ImagePlus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useCategories } from "@/hooks/useCategories";
import { parseColor, buildColor } from "@/lib/colors";
import { slugify, resolveSeo, scoreSeo, SITE_URL } from "@/lib/seo";
import { ChevronDown } from "lucide-react";

type Product = Tables<"products">;

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

type SpecRow = { label: string; value: string };

const emptyForm = {
  name: "", category: "smartphones", sub_category: "", price: 0, original_price: null as number | null,
  image_url: "/placeholder.svg", sizes: ["Standard"] as string[],
  fabric: "", description: "", trending: false, new_arrival: false, in_stock: true,
  colors: [] as string[], images: [] as string[],
  color_images: {} as Record<string, string>,
  stock_quantity: 10,
  brand: "", warranty: "",
  key_features: [] as string[],
  specs: [] as SpecRow[],
  seo_title: "", meta_description: "", focus_keyword: "",
  seo_keywords: [] as string[], seo_slug: "", image_alt_text: "",
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
  const [customColorName, setCustomColorName] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    return adminApi.uploadImage("product-images", file);
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

  const renameColor = (raw: string, newName: string) => {
    const { hex } = parseColor(raw);
    const next = buildColor(newName, hex);
    setForm((f) => {
      const ci = { ...f.color_images };
      if (ci[raw] !== undefined) {
        ci[next] = ci[raw];
        delete ci[raw];
      }
      return { ...f, colors: f.colors.map((c) => (c === raw ? next : c)), color_images: ci };
    });
  };

  const addCustomColor = () => {
    const raw = buildColor(customColorName, customColor);
    if (!customColorName.trim()) {
      toast.error("Please enter a color name");
      return;
    }
    if (!form.colors.includes(raw)) {
      setForm((f) => ({ ...f, colors: [...f.colors, raw] }));
      setCustomColorName("");
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
    mutationFn: async (raw: typeof form) => {
      const baseSlug = (raw.seo_slug || "").trim() || slugify(raw.name);
      const taken = new Set(
        products
          .filter((p) => p.id !== editingId)
          .map((p) => ((p as any).seo_slug || "").trim())
          .filter(Boolean),
      );
      let uniqueSlug = baseSlug;
      let n = 2;
      while (uniqueSlug && taken.has(uniqueSlug)) uniqueSlug = `${baseSlug}-${n++}`;

      const data = {
        ...raw,
        seo_title: raw.seo_title.trim(),
        meta_description: raw.meta_description.trim(),
        focus_keyword: raw.focus_keyword.trim(),
        seo_keywords: raw.seo_keywords.map((k) => k.trim()).filter(Boolean),
        seo_slug: uniqueSlug || null,
        image_alt_text: raw.image_alt_text.trim(),
        key_features: raw.key_features.map((f) => f.trim()).filter(Boolean),
        specs: raw.specs
          .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
          .filter((s) => s.label && s.value),
      };
      if (editingId) {
        await adminApi.update("products", data, { id: editingId });
      } else {
        await adminApi.insert("products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setSlugTouched(false);
      toast.success(editingId ? "Product updated" : "Product created");
    },
    onError: () => toast.error("Failed to save product"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete("products", { id });
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
      brand: (p as any).brand ?? "", warranty: (p as any).warranty ?? "",
      key_features: ((p as any).key_features ?? []) as string[],
      specs: (Array.isArray((p as any).specs) ? (p as any).specs : []) as SpecRow[],
      seo_title: (p as any).seo_title ?? "",
      meta_description: (p as any).meta_description ?? "",
      focus_keyword: (p as any).focus_keyword ?? "",
      seo_keywords: ((p as any).seo_keywords ?? []) as string[],
      seo_slug: (p as any).seo_slug ?? "",
      image_alt_text: (p as any).image_alt_text ?? "",
    });
    setSlugTouched(true);
    setKeywordInput("");
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setKeywordInput("");
    setDialogOpen(true);
  };

  const addKeyword = () => {
    const k = keywordInput.trim().replace(/,+$/, "");
    if (!k) return;
    if (!form.seo_keywords.includes(k)) setForm((f) => ({ ...f, seo_keywords: [...f.seo_keywords, k] }));
    setKeywordInput("");
  };

  const seoResolved = resolveSeo(form);
  const { score: seoScore, checks: seoChecks } = scoreSeo(form);

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
                          <div key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: parseColor(c).hex }} title={parseColor(c).name} />
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
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, seo_slug: slugTouched ? form.seo_slug : slugify(e.target.value) })} className="w-full border border-border px-3 py-2 bg-background text-sm" required maxLength={200} />
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
                      onClick={() => toggleColor(`${c.name}|${c.value}`)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                        form.colors.includes(`${c.name}|${c.value}`) ? "border-foreground scale-110" : "border-border hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {form.colors.includes(`${c.name}|${c.value}`) && (
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
                    className="w-9 h-9 border border-border cursor-pointer shrink-0"
                  />
                  <input
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    placeholder="Color name (e.g. Midnight Blue)"
                    maxLength={40}
                    className="flex-1 border border-border px-3 py-2 bg-background text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="text-xs border border-border px-3 py-2 hover:bg-secondary transition-colors font-body shrink-0"
                  >
                    + Add color
                  </button>
                </div>
                {/* Selected colors with image upload */}
                {form.colors.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {form.colors.map((c) => {
                      const { hex, name } = parseColor(c);
                      const colorImg = form.color_images[c];
                      return (
                        <div key={c} className="flex items-center gap-3 bg-secondary/50 border border-border p-2.5">
                          <span className="w-6 h-6 rounded-full border border-border shrink-0" style={{ backgroundColor: hex }} />
                          <input
                            value={name}
                            onChange={(e) => renameColor(c, e.target.value)}
                            maxLength={40}
                            className="text-xs font-body font-medium w-32 border border-border px-2 py-1 bg-background"
                          />
                          
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Brand Name</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Samsung" className="w-full border border-border px-3 py-2 bg-background text-sm" maxLength={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Warranty</label>
                  <input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })} placeholder="e.g. 1 Year Official Warranty" className="w-full border border-border px-3 py-2 bg-background text-sm" maxLength={200} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Spec (headline)</label>
                <input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} placeholder="e.g. 8GB RAM · 256GB · 5000mAh" className="w-full border border-border px-3 py-2 bg-background text-sm" maxLength={200} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-border px-3 py-2 bg-background text-sm min-h-[80px] resize-none" maxLength={2000} />
              </div>

              {/* Key Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Key Features</label>
                  <button type="button" onClick={() => setForm({ ...form, key_features: [...form.key_features, ""] })} className="text-xs border border-border px-2 py-1 hover:bg-secondary">+ Add feature</button>
                </div>
                <div className="space-y-2">
                  {form.key_features.length === 0 && <p className="text-[11px] text-muted-foreground">কোনো feature নেই — "Add feature" চাপুন।</p>}
                  {form.key_features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={f}
                        onChange={(e) => {
                          const next = [...form.key_features];
                          next[i] = e.target.value;
                          setForm({ ...form, key_features: next });
                        }}
                        placeholder="e.g. 120Hz AMOLED Display"
                        className="flex-1 border border-border px-3 py-2 bg-background text-sm"
                        maxLength={160}
                      />
                      <button type="button" onClick={() => setForm({ ...form, key_features: form.key_features.filter((_, x) => x !== i) })} className="px-2 border border-border hover:text-destructive">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Specifications</label>
                  <button type="button" onClick={() => setForm({ ...form, specs: [...form.specs, { label: "", value: "" }] })} className="text-xs border border-border px-2 py-1 hover:bg-secondary">+ Add spec</button>
                </div>
                <div className="space-y-2">
                  {form.specs.length === 0 && <p className="text-[11px] text-muted-foreground">Label ও Value দিয়ে spec table তৈরি করুন (যেমন Display → 6.7" AMOLED)।</p>}
                  {form.specs.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={s.label}
                        onChange={(e) => {
                          const next = [...form.specs];
                          next[i] = { ...next[i], label: e.target.value };
                          setForm({ ...form, specs: next });
                        }}
                        placeholder="Label (Display)"
                        className="w-1/3 border border-border px-3 py-2 bg-background text-sm"
                        maxLength={60}
                      />
                      <input
                        value={s.value}
                        onChange={(e) => {
                          const next = [...form.specs];
                          next[i] = { ...next[i], value: e.target.value };
                          setForm({ ...form, specs: next });
                        }}
                        placeholder="Value (6.7 inch AMOLED)"
                        className="flex-1 border border-border px-3 py-2 bg-background text-sm"
                        maxLength={160}
                      />
                      <button type="button" onClick={() => setForm({ ...form, specs: form.specs.filter((_, x) => x !== i) })} className="px-2 border border-border hover:text-destructive">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-6 flex-wrap">
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
              <div>
                <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => {
                    const qty = +e.target.value;
                    setForm({ ...form, stock_quantity: qty, in_stock: qty > 0 });
                  }}
                  className="w-full border border-border px-3 py-2 bg-background text-sm"
                  min={0}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  0 = Out of Stock badge দেখাবে। 1-3 = "Only X left" badge।
                </p>
              </div>

              {/* ── SEO Settings ───────────────────────────── */}
              <div className="border border-border bg-secondary/20">
                <button
                  type="button"
                  onClick={() => setSeoOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-3 text-sm font-display font-semibold"
                >
                  <span className="flex items-center gap-2">
                    SEO Settings
                    <span className={`text-[10px] font-body px-2 py-0.5 rounded-full ${seoScore >= 80 ? "bg-green-100 text-green-700" : seoScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {seoScore}/100
                    </span>
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${seoOpen ? "rotate-180" : ""}`} />
                </button>

                {seoOpen && (
                  <div className="px-3 pb-4 space-y-4 border-t border-border pt-4">
                    {/* SEO Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium">SEO Title</label>
                        <span className={`text-[11px] ${form.seo_title.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                          {form.seo_title.length}/60
                        </span>
                      </div>
                      <input
                        value={form.seo_title}
                        onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                        placeholder="T-Wolf T20 RGB Gaming Keyboard | Device Hub"
                        className="w-full border border-border px-3 py-2 bg-background text-sm"
                        maxLength={120}
                      />
                      {form.seo_title.length > 60 && (
                        <p className="text-[11px] text-destructive mt-1">Too long — Google usually cuts off after 60 characters.</p>
                      )}
                      {!form.seo_title && (
                        <p className="text-[11px] text-muted-foreground mt-1">Empty — the product name will be used automatically.</p>
                      )}
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium">Meta Description</label>
                        <span className={`text-[11px] ${form.meta_description.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                          {form.meta_description.length}/160
                        </span>
                      </div>
                      <textarea
                        value={form.meta_description}
                        onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                        placeholder="Buy T-Wolf T20 RGB Gaming Keyboard in Bangladesh. Responsive performance, RGB lighting and a 104-key layout from Device Hub."
                        className="w-full border border-border px-3 py-2 bg-background text-sm min-h-[70px] resize-none"
                        maxLength={320}
                      />
                      {form.meta_description.length > 0 && form.meta_description.length < 150 && (
                        <p className="text-[11px] text-amber-600 mt-1">A bit short — 150-160 characters works best.</p>
                      )}
                      {form.meta_description.length > 160 && (
                        <p className="text-[11px] text-destructive mt-1">Too long — keep it within 160 characters.</p>
                      )}
                      {!form.meta_description && (
                        <p className="text-[11px] text-muted-foreground mt-1">Empty — a summary of the product description will be used.</p>
                      )}
                    </div>

                    {/* Focus keyword */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Focus Keyword</label>
                      <input
                        value={form.focus_keyword}
                        onChange={(e) => setForm({ ...form, focus_keyword: e.target.value })}
                        placeholder="gaming keyboard Bangladesh"
                        className="w-full border border-border px-3 py-2 bg-background text-sm"
                        maxLength={100}
                      />
                    </div>

                    {/* Keywords chips */}
                    <div>
                      <label className="block text-sm font-medium mb-1">SEO Keywords</label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {form.seo_keywords.map((k) => (
                          <span key={k} className="flex items-center gap-1 bg-secondary border border-border text-xs px-2 py-1">
                            {k}
                            <button type="button" onClick={() => setForm({ ...form, seo_keywords: form.seo_keywords.filter((x) => x !== k) })} className="hover:text-destructive">
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                        {form.seo_keywords.length === 0 && (
                          <span className="text-[11px] text-muted-foreground">e.g. "RGB keyboard", "gaming keyboard", "T-Wolf T20"</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                          placeholder="Type a keyword and press Enter"
                          className="flex-1 border border-border px-3 py-2 bg-background text-sm"
                          maxLength={80}
                        />
                        <button type="button" onClick={addKeyword} className="text-xs border border-border px-3 py-2 hover:bg-secondary">+ Add</button>
                      </div>
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium mb-1">SEO Slug</label>
                      <div className="flex gap-2">
                        <input
                          value={form.seo_slug}
                          onChange={(e) => { setSlugTouched(true); setForm({ ...form, seo_slug: slugify(e.target.value) }); }}
                          placeholder="t-wolf-t20-rgb-gaming-keyboard"
                          className="flex-1 border border-border px-3 py-2 bg-background text-sm"
                          maxLength={90}
                        />
                        <button
                          type="button"
                          onClick={() => { setSlugTouched(false); setForm({ ...form, seo_slug: slugify(form.name) }); }}
                          className="text-xs border border-border px-3 py-2 hover:bg-secondary whitespace-nowrap"
                        >
                          Regenerate
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">Old product links keep working — the slug is an extra address.</p>
                    </div>

                    {/* Alt text */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Image Alt Text</label>
                      <input
                        value={form.image_alt_text}
                        onChange={(e) => setForm({ ...form, image_alt_text: e.target.value })}
                        placeholder="T-Wolf T20 RGB gaming keyboard with backlit keys"
                        className="w-full border border-border px-3 py-2 bg-background text-sm"
                        maxLength={160}
                      />
                      {!form.image_alt_text && (
                        <p className="text-[11px] text-muted-foreground mt-1">Empty — the product name will be used.</p>
                      )}
                    </div>

                    {/* Google preview */}
                    <div className="border border-border bg-background p-3">
                      <p className="text-[11px] font-body uppercase tracking-wide text-muted-foreground mb-2">Search preview</p>
                      <p className="text-[13px] text-muted-foreground truncate">{SITE_URL.replace("https://", "")}/product/{seoResolved.slug || "product-slug"}</p>
                      <p className="text-[18px] leading-snug text-[#1a0dab] truncate">{seoResolved.title}</p>
                      <p className="text-[13px] text-muted-foreground line-clamp-2">{seoResolved.description}</p>
                    </div>

                    {/* Score + checklist */}
                    <div className="border border-border bg-background p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-display font-semibold">SEO Score</span>
                        <span className="text-sm font-semibold">{seoScore}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary mb-3">
                        <div className={`h-full ${seoScore >= 80 ? "bg-green-600" : seoScore >= 50 ? "bg-amber-500" : "bg-destructive"}`} style={{ width: `${seoScore}%` }} />
                      </div>
                      <ul className="space-y-1">
                        {seoChecks.map((c, i) => (
                          <li key={i} className={`text-[12px] flex gap-2 ${c.ok ? "text-green-700" : "text-amber-600"}`}>
                            <span>{c.ok ? "✓" : "⚠"}</span>
                            <span>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
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
