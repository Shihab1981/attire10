import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { categoryImages, type Category } from "@/data/products";
import { divisionNames, getDistricts, getUpazilas } from "@/data/bangladesh-locations";
import { toast } from "sonner";
import { ChevronDown, Shield, Truck, CreditCard, MapPin, User, Phone, Home, Tag, X, ArrowRight, Lock } from "lucide-react";
import { motion } from "framer-motion";

const FREE_SHIPPING_THRESHOLD = 2000;
const getShippingCharge = (division: string, subtotal: number) => subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (division === "ঢাকা" ? 60 : 120);

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    division: "",
    district: "",
    upazila: "",
    address: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = totalPrice();
  const districts = getDistricts(form.division);
  const upazilas = getUpazilas(form.division, form.district);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .single();
    if (error || !data) { toast.error("Invalid or expired coupon code"); return; }
    setAppliedCoupon(data.code);
    const d = data.type === "percent" ? Math.round(subtotal * data.value / 100) : data.value;
    setDiscount(d);
    toast.success(`Coupon "${data.code}" applied! You save ৳${d.toLocaleString()}`);
  };

  const removeCoupon = () => { setAppliedCoupon(null); setDiscount(0); setCouponCode(""); };
  const shippingCharge = getShippingCharge(form.division, subtotal);
  const finalTotal = Math.max(0, subtotal + shippingCharge - discount);

  const fullAddress = [form.upazila, form.district, form.division, form.address].filter(Boolean).join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.division || !form.district || !form.upazila || !form.address.trim()) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    if (form.phone.trim().length < 10) { toast.error("সঠিক ফোন নম্বর দিন"); return; }

    setSubmitting(true);
    try {
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: fullAddress,
        subtotal,
        discount,
        coupon_code: appliedCoupon,
        total_price: finalTotal,
        status: "pending",
      }).select().single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderPlaced(true);
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch {
      toast.error("অর্ডার প্লেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) { navigate("/cart"); return null; }

  const getImage = (item: typeof items[0]) => {
    const url = item.product.image_url;
    return url && url !== "/placeholder.svg" ? url : categoryImages[item.product.category as Category] || "/placeholder.svg";
  };

  const SelectField = ({ label, value, onChange, options, placeholder, disabled = false, icon: Icon }: {
    label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean; icon?: React.ElementType;
  }) => (
    <div>
      <label className="block text-[11px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">{label} *</label>
      <div className="relative group">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full border border-border ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all appearance-none disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );

  const stepNumber = (n: number) => (
    <span className="w-7 h-7 rounded-full bg-foreground text-primary-foreground text-xs font-display font-bold flex items-center justify-center shrink-0">
      {n}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-14">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 md:mb-14"
          >
            <div className="h-[2px] w-8 bg-accent mb-4" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Secure</p>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">Checkout</h1>
            {/* Progress */}
            <div className="flex items-center gap-2 mt-6 text-[10px] font-body tracking-[0.15em] uppercase text-muted-foreground">
              <Link to="/cart" className="hover:text-foreground transition-colors">Cart</Link>
              <span className="text-border">→</span>
              <span className="text-foreground font-semibold">Checkout</span>
              <span className="text-border">→</span>
              <span>Confirmation</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              {/* Step 1: Personal Info */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 bg-secondary/40 border-b border-border">
                  {stepNumber(1)}
                  <h2 className="font-display font-bold text-base">ব্যক্তিগত তথ্য</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-[11px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">পুরো নাম *</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                        placeholder="আপনার পুরো নাম লিখুন"
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">ফোন নম্বর *</label>
                    <div className="relative group">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                        placeholder="01XXXXXXXXX"
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2: Delivery */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 bg-secondary/40 border-b border-border">
                  {stepNumber(2)}
                  <h2 className="font-display font-bold text-base">ডেলিভারি ঠিকানা</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SelectField
                      label="বিভাগ"
                      value={form.division}
                      onChange={(v) => setForm({ ...form, division: v, district: "", upazila: "" })}
                      options={divisionNames}
                      placeholder="বিভাগ নির্বাচন করুন"
                      icon={MapPin}
                    />
                    <SelectField
                      label="জেলা"
                      value={form.district}
                      onChange={(v) => setForm({ ...form, district: v, upazila: "" })}
                      options={districts}
                      placeholder="জেলা নির্বাচন করুন"
                      disabled={!form.division}
                      icon={MapPin}
                    />
                  </div>
                  <SelectField
                    label="উপজেলা"
                    value={form.upazila}
                    onChange={(v) => setForm({ ...form, upazila: v })}
                    options={upazilas}
                    placeholder="উপজেলা নির্বাচন করুন"
                    disabled={!form.district}
                    icon={MapPin}
                  />
                  <div>
                    <label className="block text-[11px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">বিস্তারিত ঠিকানা *</label>
                    <div className="relative group">
                      <Home size={16} className="absolute left-4 top-4 text-muted-foreground/60 group-focus-within:text-accent transition-colors" />
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full border border-border pl-11 pr-4 py-3.5 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all min-h-[100px] resize-none"
                        placeholder="বাড়ি নং, রোড নং, এলাকার নাম ইত্যাদি"
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3: Payment */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 bg-secondary/40 border-b border-border">
                  {stepNumber(3)}
                  <h2 className="font-display font-bold text-base">পেমেন্ট পদ্ধতি</h2>
                </div>
                <div className="p-6">
                  <div className="border-2 border-accent bg-accent/5 p-5 flex items-start gap-4">
                    <div className="w-5 h-5 mt-0.5 rounded-full border-[5px] border-accent shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-accent" />
                        <p className="font-display font-bold text-sm">ক্যাশ অন ডেলিভারি (COD)</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-body mt-1.5 leading-relaxed">
                        পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্ট প্রয়োজন নেই।
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={submitting}
                  className="relative w-full bg-foreground text-primary-foreground py-5 font-display font-bold text-sm tracking-wide hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group active:scale-[0.99]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Lock size={15} />
                    {submitting ? "অর্ডার প্লেস হচ্ছে..." : `অর্ডার প্লেস করুন — ৳${finalTotal.toLocaleString()}`}
                    {!submitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground font-body">
                  <span className="flex items-center gap-1"><Shield size={12} className="text-accent" /> Secure Order</span>
                  <span className="flex items-center gap-1"><Truck size={12} className="text-accent" /> Fast Delivery</span>
                </div>
              </motion.div>
            </form>

            {/* Order Summary Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 border border-border overflow-hidden">
                <div className="bg-foreground text-primary-foreground px-6 py-4">
                  <h2 className="font-display font-bold text-base tracking-wide">অর্ডার সামারি</h2>
                  <p className="text-primary-foreground/50 text-[10px] font-body mt-1">{items.length} টি পণ্য</p>
                </div>

                <div className="p-6 bg-background">
                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.size}`} className="flex gap-3 group">
                        <div className="w-16 h-20 bg-secondary shrink-0 overflow-hidden relative">
                          <img src={getImage(item)} alt={item.product.name} className="w-full h-full object-cover" />
                          <span className="absolute -top-0.5 -right-0.5 bg-foreground text-primary-foreground text-[9px] w-5 h-5 flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-semibold line-clamp-1">{item.product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-body mt-0.5 tracking-wider uppercase">Size: {item.size}</p>
                          <p className="text-sm font-body font-bold mt-1">৳{(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="border-t border-border pt-5 mb-5">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-accent/10 border border-accent/20 px-4 py-3">
                        <span className="flex items-center gap-2 text-sm font-body font-semibold text-accent">
                          <Tag size={14} />
                          {appliedCoupon}
                        </span>
                        <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full border border-border pl-9 pr-3 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent transition-colors"
                            placeholder="কুপন কোড"
                            maxLength={20}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={applyCoupon}
                          className="px-5 py-2.5 bg-secondary text-foreground text-xs font-body font-semibold tracking-wider uppercase hover:bg-foreground hover:text-primary-foreground transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 text-sm font-body border-t border-border pt-5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">সাবটোটাল</span>
                      <span className="font-medium">৳{subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-accent">
                        <span className="flex items-center gap-1"><Tag size={12} /> ডিসকাউন্ট</span>
                        <span className="font-semibold">-৳{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Truck size={13} className="text-accent" />
                        ডেলিভারি {form.division ? `(${form.division})` : ""}
                      </span>
                      <span>৳{shippingCharge}</span>
                    </div>

                    <div className="section-divider my-2" />

                    <div className="flex justify-between items-baseline pt-2">
                      <span className="font-display font-bold text-base">মোট</span>
                      <span className="font-display font-extrabold text-xl">৳{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
