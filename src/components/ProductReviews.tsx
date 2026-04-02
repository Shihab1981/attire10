import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send, User, ImagePlus, X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductReviewsProps {
  productId: string;
}

const RatingStars = ({
  value,
  interactive = false,
  size = 16,
  onRate,
  hoveredStar,
  onHover,
  onLeave,
}: {
  value: number;
  interactive?: boolean;
  size?: number;
  onRate?: (v: number) => void;
  hoveredStar?: number;
  onHover?: (v: number) => void;
  onLeave?: () => void;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onRate?.(s)}
        onMouseEnter={() => interactive && onHover?.(s)}
        onMouseLeave={() => interactive && onLeave?.()}
        className={interactive ? "cursor-pointer" : "cursor-default"}
      >
        <Star
          size={size}
          className={`transition-colors ${
            s <= (interactive ? (hoveredStar || value) : value)
              ? "fill-accent text-accent"
              : "text-border"
          }`}
        />
      </button>
    ))}
  </div>
);

const ReviewImageGallery = ({ images }: { images: string[] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 mt-3 flex-wrap">
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => { setActiveIdx(i); setLightboxOpen(true); }}
            className="relative w-16 h-16 rounded overflow-hidden border border-border hover:border-accent/40 transition-colors group"
          >
            <img src={url} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
              <ZoomIn size={14} className="text-background opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-2xl p-2 bg-background border-border">
          <img src={images[activeIdx]} alt="Review photo" className="w-full h-auto max-h-[70vh] object-contain rounded" />
          {images.length > 1 && (
            <div className="flex gap-2 justify-center mt-2">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors ${i === activeIdx ? "border-accent" : "border-border"}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) toast.error("শুধুমাত্র 5MB পর্যন্ত ছবি আপলোড করা যাবে");
    const total = [...selectedFiles, ...valid].slice(0, 4);
    setSelectedFiles(total);
    setPreviews(total.map(f => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop();
      const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("review-images").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("review-images").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages();
      }
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim(),
        images: imageUrls,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setName(""); setComment(""); setRating(5); setShowForm(false);
      previews.forEach(p => URL.revokeObjectURL(p));
      setSelectedFiles([]); setPreviews([]);
      setUploading(false);
      toast.success("রিভিউ সফলভাবে যোগ হয়েছে!");
    },
    onError: () => { setUploading(false); toast.error("রিভিউ যোগ করতে সমস্যা হয়েছে"); },
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("নাম লিখুন"); return; }
    if (!comment.trim()) { toast.error("মন্তব্য লিখুন"); return; }
    mutation.mutate();
  };

  return (
    <section className="mt-16 md:mt-24">
      <div className="section-divider mb-12" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Customer Feedback</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Reviews & Ratings</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[11px] font-body font-bold tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors"
        >
          রিভিউ লিখুন
        </button>
      </div>

      {/* Summary + Distribution */}
      {reviews.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="border border-border p-6 flex flex-col items-center justify-center text-center">
            <span className="font-display text-5xl font-bold text-accent">{avgRating}</span>
            <RatingStars value={Math.round(Number(avgRating))} size={18} />
            <p className="text-xs text-muted-foreground font-body mt-2">{reviews.length}টি রিভিউ</p>
          </div>
          <div className="md:col-span-2 border border-border p-6">
            <div className="space-y-2.5">
              {ratingDist.map((d) => (
                <div key={d.star} className="flex items-center gap-3 text-sm font-body">
                  <span className="w-6 text-right text-muted-foreground">{d.star}</span>
                  <Star size={12} className="fill-accent text-accent shrink-0" />
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted-foreground text-xs">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-10"
          >
            <div className="border border-border p-6 space-y-5">
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">রেটিং</label>
                <RatingStars value={rating} interactive size={24} onRate={setRating} hoveredStar={hoveredStar} onHover={setHoveredStar} onLeave={() => setHoveredStar(0)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">আপনার নাম</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full bg-secondary/50 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div className="sm:col-span-1" />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">মন্তব্য</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="আপনার অভিজ্ঞতা জানান..."
                  rows={3}
                  className="w-full bg-secondary/50 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">ছবি যোগ করুন (সর্বোচ্চ ৪টি)</label>
                <div className="flex gap-3 flex-wrap items-center">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded border border-border overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {selectedFiles.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded border-2 border-dashed border-border hover:border-accent/40 flex flex-col items-center justify-center gap-1 transition-colors text-muted-foreground hover:text-accent"
                    >
                      <ImagePlus size={18} />
                      <span className="text-[9px] font-body">ছবি</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || uploading}
                className="shimmer-btn inline-flex items-center gap-2 px-8 py-3 text-accent-foreground text-[11px] font-bold tracking-[0.15em] uppercase font-body disabled:opacity-50"
              >
                <Send size={14} />
                {mutation.isPending || uploading ? "সাবমিট হচ্ছে..." : "রিভিউ সাবমিট"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-border">
          <Star size={32} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground font-body text-sm">এখনো কোনো রিভিউ নেই</p>
          <p className="text-muted-foreground/60 font-body text-xs mt-1">প্রথম রিভিউ দিন!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-border p-5 hover:border-accent/20 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <User size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display font-semibold text-sm">{review.reviewer_name}</span>
                    <RatingStars value={review.rating} size={12} />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-body mb-2.5">
                    {new Date(review.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">{review.comment}</p>
                  <ReviewImageGallery images={(review as any).images || []} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
