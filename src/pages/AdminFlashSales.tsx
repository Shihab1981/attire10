import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AdminFlashSales = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [endsAt, setEndsAt] = useState<Date | undefined>();
  const [endsTime, setEndsTime] = useState("23:59");

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["admin-flash-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*, products(name, price, image_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products-for-flash"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, price").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!endsAt) throw new Error("End date required");
      const [h, m] = endsTime.split(":").map(Number);
      const endDate = new Date(endsAt);
      endDate.setHours(h, m, 0, 0);

      const { error } = await supabase.from("flash_sales").insert({
        product_id: productId,
        sale_price: parseInt(salePrice),
        ends_at: endDate.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
      setShowForm(false);
      setProductId("");
      setSalePrice("");
      setEndsAt(undefined);
      setEndsTime("23:59");
      toast.success("Flash sale তৈরি হয়েছে!");
    },
    onError: () => toast.error("Flash sale তৈরি করতে সমস্যা হয়েছে"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("flash_sales").update({ active: !active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
      toast.success("Status updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("flash_sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
      toast.success("Flash sale ডিলিট হয়েছে");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast.error("প্রোডাক্ট সিলেক্ট করুন"); return; }
    if (!salePrice || parseInt(salePrice) <= 0) { toast.error("সেল প্রাইস দিন"); return; }
    if (!endsAt) { toast.error("শেষ তারিখ সিলেক্ট করুন"); return; }
    createMutation.mutate();
  };

  const selectedProduct = products.find((p) => p.id === productId);
  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                <Zap size={24} className="text-accent" />
                Flash Sales
              </h1>
              <p className="text-muted-foreground text-sm font-body mt-1">ফ্ল্যাশ সেল তৈরি ও ম্যানেজ করুন</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-xs font-body font-bold tracking-wider uppercase hover:bg-accent/90 transition-colors"
            >
              <Plus size={16} />
              নতুন সেল
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-card border border-border p-6 mb-8 space-y-5"
            >
              <h3 className="font-display font-bold text-sm mb-4">নতুন Flash Sale তৈরি করুন</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Product select */}
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">প্রোডাক্ট</label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full bg-secondary/50 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">সিলেক্ট করুন</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — ৳{p.price}</option>
                    ))}
                  </select>
                </div>

                {/* Sale price */}
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">
                    সেল প্রাইস {selectedProduct && <span className="text-accent">(মূল: ৳{selectedProduct.price})</span>}
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="৳"
                    className="w-full bg-secondary/50 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* End date */}
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">শেষ তারিখ</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full bg-secondary/50 border border-border px-4 py-3 text-sm font-body text-left flex items-center gap-2",
                          !endsAt && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon size={14} />
                        {endsAt ? format(endsAt, "PPP") : "তারিখ সিলেক্ট করুন"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endsAt}
                        onSelect={setEndsAt}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End time */}
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-2 block">শেষ সময়</label>
                  <input
                    type="time"
                    value={endsTime}
                    onChange={(e) => setEndsTime(e.target.value)}
                    className="w-full bg-secondary/50 border border-border px-4 py-3 text-sm font-body focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {selectedProduct && salePrice && (
                <div className="bg-accent/10 border border-accent/20 p-4 text-sm font-body">
                  <span className="font-bold">ডিসকাউন্ট: </span>
                  ৳{(selectedProduct.price - parseInt(salePrice)).toLocaleString()} ({Math.round(((selectedProduct.price - parseInt(salePrice)) / selectedProduct.price) * 100)}% off)
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="shimmer-btn px-6 py-2.5 text-accent-foreground text-xs font-body font-bold tracking-wider uppercase disabled:opacity-50"
                >
                  {createMutation.isPending ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-border text-xs font-body font-bold tracking-wider uppercase hover:bg-secondary transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </motion.form>
          )}

          {/* Sales List */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-16 border border-border bg-card">
              <Zap size={40} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-body">কোনো Flash Sale নেই</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.map((sale: any) => {
                const product = sale.products;
                const expired = isExpired(sale.ends_at);
                const discount = product ? Math.round(((product.price - sale.sale_price) / product.price) * 100) : 0;

                return (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "bg-card border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity",
                      (expired || !sale.active) && "opacity-60"
                    )}
                  >
                    {/* Product image */}
                    {product?.image_url && (
                      <div className="w-14 h-14 bg-secondary shrink-0 overflow-hidden">
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm line-clamp-1">{product?.name || "Unknown"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs font-body text-muted-foreground">
                        <span>মূল: ৳{product?.price?.toLocaleString()}</span>
                        <span className="text-accent font-bold">সেল: ৳{sale.sale_price.toLocaleString()}</span>
                        <span className="bg-accent/10 text-accent px-1.5 py-0.5 text-[10px] font-bold">-{discount}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-body mt-1">
                        শেষ: {format(new Date(sale.ends_at), "PPP p")}
                        {expired && <span className="text-destructive ml-2 font-bold">মেয়াদ শেষ</span>}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleMutation.mutate({ id: sale.id, active: sale.active })}
                        className={cn(
                          "p-2 rounded-sm transition-colors",
                          sale.active ? "text-accent hover:bg-accent/10" : "text-muted-foreground hover:bg-secondary"
                        )}
                        title={sale.active ? "Deactivate" : "Activate"}
                      >
                        {sale.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("এই Flash Sale ডিলিট করতে চান?")) deleteMutation.mutate(sale.id);
                        }}
                        className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminFlashSales;
