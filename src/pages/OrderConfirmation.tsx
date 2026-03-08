import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Package, Truck, MapPin, Phone, User, ArrowRight, Clock, Download, ShieldCheck, Star, Copy, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

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

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id.slice(0, 8).toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const steps = [
    { label: "অর্ডার প্লেসড", done: true },
    { label: "কনফার্মড", done: order.status !== "pending" },
    { label: "শিপিং", done: order.status === "shipped" || order.status === "delivered" },
    { label: "ডেলিভারড", done: order.status === "delivered" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero success section */}
        <section className="relative overflow-hidden bg-foreground text-primary-foreground">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="container py-14 md:py-20 max-w-3xl text-center relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <CheckCircle size={40} className="text-accent" />
              </motion.div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl md:text-4xl font-bold mb-3"
            >
              অর্ডার সফল হয়েছে!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-primary-foreground/60 text-sm md:text-base font-body max-w-md mx-auto"
            >
              ধন্যবাদ! আপনার অর্ডার নিশ্চিত করতে আমরা শীঘ্রই যোগাযোগ করবো।
            </motion.p>

            {/* Order ID chip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 inline-flex items-center gap-3 bg-primary-foreground/10 border border-primary-foreground/10 px-5 py-2.5 rounded-full"
            >
              <span className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/50 font-body">Order ID</span>
              <span className="font-display font-bold text-sm tracking-wider">{order.id.slice(0, 8).toUpperCase()}</span>
              <button onClick={copyOrderId} className="text-primary-foreground/50 hover:text-accent transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </motion.div>
          </div>
        </section>

        <div className="container py-10 md:py-14 max-w-4xl">
          {/* Progress tracker */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 md:mb-14"
          >
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-[2px] bg-border" />
              <div
                className="absolute top-4 left-0 h-[2px] bg-accent transition-all duration-700"
                style={{ width: `${(steps.filter(s => s.done).length - 1) / (steps.length - 1) * 100}%` }}
              />
              {steps.map((step, i) => (
                <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display transition-colors ${
                      step.done
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                        : "bg-secondary text-muted-foreground border-2 border-border"
                    }`}
                  >
                    {step.done ? <Check size={14} /> : i + 1}
                  </motion.div>
                  <span className={`text-[9px] md:text-[10px] tracking-[0.1em] uppercase font-body whitespace-nowrap ${
                    step.done ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left column - details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Estimated Delivery */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-accent/5 border border-accent/20 p-5 md:p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Truck size={18} className="text-accent" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm mb-1">আনুমানিক ডেলিভারি</p>
                  <p className="font-body text-sm text-foreground">{estimatedDelivery()}</p>
                  <p className="text-[10px] text-muted-foreground font-body mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={11} />
                    ক্যাশ অন ডেলিভারি (COD)
                  </p>
                </div>
              </motion.div>

              {/* Customer & Address */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                <div className="border border-border p-5 hover:border-accent/30 transition-colors">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-4 flex items-center gap-1.5">
                    <User size={11} />
                    কাস্টমার তথ্য
                  </p>
                  <div className="space-y-3">
                    <p className="font-display font-semibold text-sm">{order.customer_name}</p>
                    <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
                      <Phone size={13} className="text-accent shrink-0" />
                      {order.customer_phone}
                    </p>
                  </div>
                </div>
                <div className="border border-border p-5 hover:border-accent/30 transition-colors">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body mb-4 flex items-center gap-1.5">
                    <MapPin size={11} />
                    ডেলিভারি ঠিকানা
                  </p>
                  <p className="font-body text-sm leading-relaxed">{order.customer_address}</p>
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="border border-border"
              >
                <div className="px-5 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body flex items-center gap-2">
                    <Package size={13} />
                    অর্ডারকৃত পণ্য
                  </p>
                  <span className="text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground">
                    {orderItems.length}টি আইটেম
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {orderItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center justify-between p-5 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-secondary/60 rounded-sm flex items-center justify-center shrink-0">
                          <Package size={16} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-sm line-clamp-1">{item.product_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground font-body bg-secondary/60 px-2 py-0.5">
                              {item.size}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-body">× {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-display font-bold text-sm shrink-0 ml-4">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right column - summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-foreground text-primary-foreground p-6 md:p-7 sticky top-24">
                <h3 className="font-display font-bold text-base mb-6 pb-4 border-b border-primary-foreground/10">
                  অর্ডার সামারি
                </h3>

                <div className="space-y-3 text-sm font-body mb-6">
                  <div className="flex justify-between text-primary-foreground/60">
                    <span>সাবটোটাল</span>
                    <span>৳{order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span className="flex items-center gap-1.5">
                        <Star size={12} />
                        ডিসকাউন্ট {order.coupon_code && `(${order.coupon_code})`}
                      </span>
                      <span>-৳{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-primary-foreground/60">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      ডেলিভারি চার্জ
                    </span>
                    <span>৳{(order.total_price - order.subtotal + order.discount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-primary-foreground/10 pt-5 mb-8">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold text-base">মোট পরিশোধযোগ্য</span>
                    <span className="font-display font-bold text-2xl text-accent">৳{order.total_price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => downloadCard(order, orderItems, estimatedDelivery())}
                    className="w-full shimmer-btn flex items-center justify-center gap-2 py-3.5 text-accent-foreground text-[11px] font-bold tracking-[0.15em] uppercase font-body hover:shadow-lg hover:shadow-accent/20 transition-all"
                  >
                    <Download size={15} />
                    রিসিট ডাউনলোড
                  </button>
                  <Link
                    to={`/track-order?id=${orderId}`}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border border-primary-foreground/20 text-primary-foreground text-[11px] font-bold tracking-[0.15em] uppercase font-body hover:bg-primary-foreground/5 transition-all"
                  >
                    অর্ডার ট্র্যাক করুন
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="mt-6 pt-5 border-t border-primary-foreground/10">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-primary-foreground/30 font-body mb-1">তারিখ</p>
                  <p className="font-body text-xs text-primary-foreground/60">{orderDate}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Continue shopping */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 text-center"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent font-body transition-colors group"
            >
              শপিং চালিয়ে যান
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
