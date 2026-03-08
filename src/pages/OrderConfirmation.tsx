import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Package, Truck, MapPin, Phone, User, ArrowRight, Clock, Download } from "lucide-react";
import { useOrderCardDownload } from "@/hooks/useOrderCardDownload";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

const OrderConfirmation = () => {
  const { downloadCard } = useOrderCardDownload();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);
      if (orderRes.data) setOrder(orderRes.data);
      if (itemsRes.data) setOrderItems(itemsRes.data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  const estimatedDelivery = () => {
    if (!order) return "";
    const created = new Date(order.created_at);
    const isInsideDhaka = order.customer_address.includes("ঢাকা");
    const minDays = isInsideDhaka ? 1 : 3;
    const maxDays = isInsideDhaka ? 3 : 7;
    const minDate = new Date(created);
    minDate.setDate(minDate.getDate() + minDays);
    const maxDate = new Date(created);
    maxDate.setDate(maxDate.getDate() + maxDays);
    const fmt = (d: Date) => d.toLocaleDateString("bn-BD", { day: "numeric", month: "long" });
    return `${fmt(minDate)} — ${fmt(maxDate)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">অর্ডার খুঁজে পাওয়া যায়নি</p>
            <Link to="/" className="inline-block bg-foreground text-background px-8 py-3 font-display font-semibold text-sm">হোমে ফিরে যান</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString("bn-BD", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-10 md:py-16 max-w-3xl">
          {/* Success Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 md:mb-14"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-accent" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">অর্ডার সফলভাবে প্লেস হয়েছে!</h1>
            <p className="text-muted-foreground text-sm font-body">
              ধন্যবাদ! আপনার অর্ডার নিশ্চিত করতে আমরা শীঘ্রই যোগাযোগ করবো।
            </p>
          </motion.div>

          {/* Order ID & Date */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-border p-5 md:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-1">অর্ডার আইডি</p>
              <p className="font-display font-semibold text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-1">তারিখ</p>
              <p className="font-body text-sm">{orderDate}</p>
            </div>
          </motion.div>

          {/* Estimated Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-accent/5 border border-accent/20 p-5 md:p-6 mb-6 flex items-start gap-4"
          >
            <Truck size={22} className="text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-semibold text-sm mb-1">আনুমানিক ডেলিভারি</p>
              <p className="font-body text-sm text-muted-foreground">{estimatedDelivery()}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-1">ক্যাশ অন ডেলিভারি (COD)</p>
            </div>
          </motion.div>

          {/* Customer Info & Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-6 mb-6"
          >
            <div className="border border-border p-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-3">কাস্টমার তথ্য</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <User size={14} className="text-muted-foreground shrink-0" />
                  <span className="font-body">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <span className="font-body">{order.customer_phone}</span>
                </div>
              </div>
            </div>
            <div className="border border-border p-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-3">ডেলিভারি ঠিকানা</p>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="font-body leading-relaxed">{order.customer_address}</span>
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="border border-border mb-6"
          >
            <div className="p-5 border-b border-border">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body flex items-center gap-2">
                <Package size={14} />
                অর্ডারকৃত পণ্য ({orderItems.length})
              </p>
            </div>
            <div className="divide-y divide-border">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-sm line-clamp-1">{item.product_name}</p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body mt-1">
                      Size: {item.size} &middot; Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-display font-semibold text-sm shrink-0 ml-4">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-secondary/40 border border-border p-5 md:p-6 mb-10"
          >
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">সাবটোটাল</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>ডিসকাউন্ট {order.coupon_code && `(${order.coupon_code})`}</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock size={13} />
                  ডেলিভারি চার্জ
                </span>
                <span>৳{(order.total_price - order.subtotal + order.discount).toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-display font-bold text-base">মোট</span>
                <span className="font-display font-bold text-xl">৳{order.total_price.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => downloadCard(order, orderItems, estimatedDelivery())}
              className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 font-display font-semibold text-sm tracking-wide hover:bg-accent/90 transition-colors w-full sm:w-auto"
            >
              <Download size={16} />
              রিসিট ডাউনলোড করুন
            </button>
            <Link
              to={`/track-order?id=${orderId}`}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3.5 font-display font-semibold text-sm tracking-wide hover:bg-foreground/90 transition-colors w-full sm:w-auto"
            >
              অর্ডার ট্র্যাক করুন
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors font-body w-full sm:w-auto"
            >
              শপিং চালিয়ে যান
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
