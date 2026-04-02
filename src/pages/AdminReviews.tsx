import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, Send, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import AdminAuthGate from "@/components/AdminAuthGate";

const AdminReviews = () => {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products-map"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const productMap = Object.fromEntries(products.map((p) => [p.id, p.name]));

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ admin_reply: reply, admin_reply_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      setReplyingTo(null);
      setReplyText("");
      toast.success("রিপ্লাই সফলভাবে যোগ হয়েছে!");
    },
    onError: () => toast.error("রিপ্লাই যোগ করতে সমস্যা হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("রিভিউ মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("রিভিউ মুছতে সমস্যা হয়েছে"),
  });

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id, reply: replyText.trim() });
  };

  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="max-w-4xl">
          <h1 className="font-display text-2xl font-bold mb-6">Reviews Management</h1>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">কোনো রিভিউ নেই</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-border rounded-lg p-5 bg-background">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-sm">{review.reviewer_name}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={s <= review.rating ? "fill-accent text-accent" : "text-border"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {productMap[review.product_id] || "Unknown Product"} •{" "}
                        {new Date(review.created_at).toLocaleDateString("bn-BD")}
                      </p>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>

                      {/* Review images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {review.images.map((url: string, i: number) => (
                            <img key={i} src={url} alt="" className="w-12 h-12 rounded border border-border object-cover" />
                          ))}
                        </div>
                      )}

                      {/* Existing reply */}
                      {(review as any).admin_reply && (
                        <div className="mt-3 pl-4 border-l-2 border-accent/30 bg-accent/5 p-3 rounded-r">
                          <p className="text-xs font-semibold text-accent mb-1">Admin Reply</p>
                          <p className="text-sm text-muted-foreground">{(review as any).admin_reply}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {(review as any).admin_reply_at && new Date((review as any).admin_reply_at).toLocaleDateString("bn-BD")}
                          </p>
                        </div>
                      )}

                      {/* Reply form */}
                      {replyingTo === review.id && (
                        <div className="mt-3 flex gap-2">
                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="রিপ্লাই লিখুন..."
                            className="flex-1 bg-secondary/50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:border-accent"
                            onKeyDown={(e) => e.key === "Enter" && handleReply(review.id)}
                          />
                          <button
                            onClick={() => handleReply(review.id)}
                            disabled={replyMutation.isPending}
                            className="px-3 py-2 bg-accent text-accent-foreground rounded text-sm hover:bg-accent/90 disabled:opacity-50"
                          >
                            <Send size={14} />
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            className="px-3 py-2 border border-border rounded text-sm hover:bg-secondary"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setReplyingTo(review.id);
                          setReplyText((review as any).admin_reply || "");
                        }}
                        className="p-2 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Reply"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("এই রিভিউ মুছে ফেলতে চান?")) deleteMutation.mutate(review.id);
                        }}
                        className="p-2 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminReviews;
