import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, ImagePlus, X } from "lucide-react";

const emptyForm = {
  overline: "",
  title: "",
  subtitle: "",
  cta_text: "Shop Now",
  cta_link: "/products",
  image_url: "",
  sort_order: 0,
  active: true,
};

const AdminHeroSlides = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `hero-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (editingId) {
        const { error } = await supabase.from("hero_slides").update(data).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hero_slides").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success(editingId ? "Slide updated" : "Slide created");
    },
    onError: () => toast.error("Failed to save slide"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      toast.success("Slide deleted");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("hero_slides").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] }),
  });

  const openEdit = (slide: any) => {
    setEditingId(slide.id);
    setForm({
      overline: slide.overline,
      title: slide.title,
      subtitle: slide.subtitle,
      cta_text: slide.cta_text,
      cta_link: slide.cta_link,
      image_url: slide.image_url,
      sort_order: slide.sort_order,
      active: slide.active,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: slides.length });
    setDialogOpen(true);
  };

  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Hero Slides</h1>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-sm font-display font-semibold tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Plus size={16} /> Add Slide
          </button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : slides.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm font-body">No hero slides yet. Add your first slide.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide: any) => (
              <div
                key={slide.id}
                className={`flex items-center gap-4 border border-border p-4 bg-card transition-opacity ${
                  !slide.active ? "opacity-50" : ""
                }`}
              >
                <GripVertical size={16} className="text-muted-foreground shrink-0" />
                
                {/* Image preview */}
                <div className="w-24 h-14 bg-secondary shrink-0 overflow-hidden">
                  {slide.image_url ? (
                    <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No image</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-body tracking-wider uppercase">{slide.overline}</p>
                  <p className="font-display font-bold text-sm truncate">{slide.title.replace(/\n/g, " ")}</p>
                  <p className="text-xs text-muted-foreground font-body truncate">{slide.subtitle}</p>
                </div>

                {/* CTA info */}
                <div className="hidden md:block text-right shrink-0">
                  <p className="text-xs font-body font-medium">{slide.cta_text}</p>
                  <p className="text-[10px] text-muted-foreground font-body">{slide.cta_link}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive.mutate({ id: slide.id, active: !slide.active })}
                    className="p-1.5 hover:text-accent transition-colors"
                    title={slide.active ? "Hide" : "Show"}
                  >
                    {slide.active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => openEdit(slide)} className="p-1.5 hover:text-accent transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(slide.id)} className="p-1.5 hover:text-destructive transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingId ? "Edit Slide" : "Add Slide"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Overline</label>
                <input
                  value={form.overline}
                  onChange={(e) => setForm({ ...form, overline: e.target.value })}
                  className="w-full border border-border px-3 py-2 bg-background text-sm"
                  placeholder="e.g. New Collection — SS'26"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <textarea
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-border px-3 py-2 bg-background text-sm min-h-[60px] resize-none"
                  placeholder="Use new line for line break"
                  required
                  maxLength={200}
                />
                <p className="text-[10px] text-muted-foreground mt-1">নতুন লাইনে লিখলে হিরো সেকশনে আলাদা লাইনে দেখাবে</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full border border-border px-3 py-2 bg-background text-sm"
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Button Text</label>
                  <input
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    className="w-full border border-border px-3 py-2 bg-background text-sm"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button Link</label>
                  <input
                    value={form.cta_link}
                    onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                    className="w-full border border-border px-3 py-2 bg-background text-sm"
                    placeholder="/products"
                    maxLength={200}
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Background Image</label>
                {form.image_url ? (
                  <div className="relative aspect-video bg-secondary overflow-hidden mb-2">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image_url: "" })}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="block aspect-video border-2 border-dashed border-border hover:border-foreground/40 transition-colors flex flex-col items-center justify-center cursor-pointer mb-2">
                    {uploading ? (
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    ) : (
                      <>
                        <ImagePlus size={24} className="text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Click to upload image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                )}
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-border px-3 py-2 bg-background text-sm"
                  placeholder="Or paste image URL"
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: +e.target.value })}
                    className="w-full border border-border px-3 py-2 bg-background text-sm"
                    min={0}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full bg-foreground text-background py-3 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? "Saving..." : editingId ? "Update Slide" : "Create Slide"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminHeroSlides;
