import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showForm, setShowForm] = useState(false);

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

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      setName("");
      setComment("");
      setRating(5);
      setShowForm(false);
      toast.success("রিভিউ সফলভাবে যোগ হয়েছে!");
    },
    onError: () => toast.error("রিভিউ যোগ করতে সমস্যা হয়েছে"),
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

  const RatingStars = ({ value, interactive = false, size = 16 }: { value: number; interactive?: boolean; size?: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(s)}
          onMouseEnter={() => interactive && setHoveredStar(s)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
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
                <RatingStars value={rating} interactive size={24} />
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
              <button
                type="submit"
                disabled={mutation.isPending}
                className="shimmer-btn inline-flex items-center gap-2 px-8 py-3 text-accent-foreground text-[11px] font-bold tracking-[0.15em] uppercase font-body disabled:opacity-50"
              >
                <Send size={14} />
                {mutation.isPending ? "সাবমিট হচ্ছে..." : "রিভিউ সাবমিট"}
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
