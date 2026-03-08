import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Search, Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, User, Download } from "lucide-react";
import { useOrderCardDownload } from "@/hooks/useOrderCardDownload";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

const statusSteps = [
  { key: "pending", label: "অর্ডার গৃহীত", icon: Clock },
  { key: "shipped", label: "শিপমেন্ট হয়েছে", icon: Truck },
  { key: "delivered", label: "ডেলিভারি সম্পন্ন", icon: CheckCircle },
];

const TrackOrder = () => {
  const { downloadCard } = useOrderCardDownload();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [query, setQuery] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialId);

  const searchOrder = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);

    // Try by ID first, then by phone
    let orderData: Order | null = null;
    const { data: byId } = await supabase.from("orders").select("*").eq("id", q).maybeSingle();
    if (byId) {
      orderData = byId;
    } else {
      // Try short ID match
      const { data: allOrders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const match = allOrders?.find(o => o.id.slice(0, 8).toUpperCase() === q.toUpperCase());
      if (match) {
        orderData = match;
      } else {
        // Try by phone
        const { data: byPhone } = await supabase.from("orders").select("*").eq("customer_phone", q).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (byPhone) orderData = byPhone;
      }
    }

    if (orderData) {
      setOrder(orderData);
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderData.id);
      setOrderItems(items || []);
    } else {
      setOrder(null);
      setOrderItems([]);
    }
    setLoading(false);
  };

  // Auto-search if URL has id param
  useState(() => {
    if (initialId) searchOrder();
  });

  const currentStepIndex = order
    ? order.status === "cancelled" ? -1 : statusSteps.findIndex(s => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-10 md:py-16 max-w-2xl">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Order</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">ট্র্যাক অর্ডার</h1>
            <p className="text-muted-foreground text-sm font-body mt-2">অর্ডার আইডি বা ফোন নম্বর দিয়ে খুঁজুন</p>
          </div>

          <form onSubmit={searchOrder} className="flex gap-2 mb-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="অর্ডার আইডি বা ফোন নম্বর"
              className="flex-1 border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors font-body"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-foreground text-background px-6 py-3 font-display font-semibold text-sm flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              <Search size={16} />
              খুঁজুন
            </button>
          </form>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && searched && !order && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <XCircle size={40} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-body">কোনো অর্ডার খুঁজে পাওয়া যায়নি</p>
            </motion.div>
          )}

          {!loading && order && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Order ID */}
              <div className="border border-border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-1">অর্ডার আইডি</p>
                  <p className="font-display font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-1">তারিখ</p>
                  <p className="font-body text-sm">
                    {new Date(order.created_at).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Status Tracker */}
              {order.status === "cancelled" ? (
                <div className="bg-destructive/10 border border-destructive/20 p-5 flex items-center gap-4">
                  <XCircle size={24} className="text-destructive shrink-0" />
                  <div>
                    <p className="font-display font-semibold text-sm">অর্ডার বাতিল করা হয়েছে</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">এই অর্ডারটি বাতিল করা হয়েছে।</p>
                  </div>
                </div>
              ) : (
                <div className="border border-border p-5 md:p-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-6">অর্ডার স্ট্যাটাস</p>
                  <div className="flex items-center justify-between relative">
                    {/* Progress line */}
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
                    <div
                      className="absolute top-5 left-8 h-0.5 bg-accent transition-all duration-500"
                      style={{ width: `calc(${(currentStepIndex / (statusSteps.length - 1)) * 100}% - 4rem)` }}
                    />
                    {statusSteps.map((step, i) => {
                      const isActive = i <= currentStepIndex;
                      const Icon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                            <Icon size={18} />
                          </div>
                          <p className={`text-[10px] font-body mt-2 text-center ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="border border-border p-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-3">কাস্টমার</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-sm"><User size={14} className="text-muted-foreground" /><span>{order.customer_name}</span></div>
                    <div className="flex items-center gap-2.5 text-sm"><Phone size={14} className="text-muted-foreground" /><span>{order.customer_phone}</span></div>
                  </div>
                </div>
                <div className="border border-border p-5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-3">ঠিকানা</p>
                  <div className="flex items-start gap-2.5 text-sm">
                    <MapPin size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{order.customer_address}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border border-border">
                <div className="p-5 border-b border-border">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body flex items-center gap-2">
                    <Package size={14} /> পণ্য তালিকা
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between p-5">
                      <div>
                        <p className="font-display font-medium text-sm">{item.product_name}</p>
                        <p className="text-[10px] uppercase text-muted-foreground font-body mt-1">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-display font-semibold text-sm">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-secondary/40 border border-border p-5">
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between"><span className="text-muted-foreground">সাবটোটাল</span><span>৳{order.subtotal.toLocaleString()}</span></div>
                  {order.discount > 0 && <div className="flex justify-between text-accent"><span>ডিসকাউন্ট</span><span>-৳{order.discount.toLocaleString()}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি</span><span>৳{(order.total_price - order.subtotal + order.discount).toLocaleString()}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-display font-bold">মোট</span>
                    <span className="font-display font-bold text-lg">৳{order.total_price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
