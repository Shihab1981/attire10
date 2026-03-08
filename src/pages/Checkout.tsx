import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { categoryImages, type Category } from "@/data/products";
import { divisionNames, getDistricts, getUpazilas } from "@/data/bangladesh-locations";
import { toast } from "sonner";
import { CheckCircle, ChevronDown } from "lucide-react";

const getShippingCharge = (division: string) => division === "ঢাকা" ? 60 : 120;

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

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
  const shippingCharge = getShippingCharge(form.division);
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

      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch {
      toast.error("অর্ডার প্লেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) { navigate("/cart"); return null; }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <CheckCircle size={64} className="mx-auto text-accent mb-6" />
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">অর্ডার সফলভাবে প্লেস হয়েছে!</h1>
            <p className="text-muted-foreground mb-6">আপনার অর্ডার নিশ্চিত করতে আমরা {form.phone} নম্বরে যোগাযোগ করবো।</p>
            <Link to="/" className="inline-block bg-foreground text-background px-8 py-3 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors">শপিং চালিয়ে যান</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getImage = (item: typeof items[0]) => {
    const url = item.product.image_url;
    return url && url !== "/placeholder.svg" ? url : categoryImages[item.product.category as Category] || "/placeholder.svg";
  };

  const SelectField = ({ label, value, onChange, options, placeholder, disabled = false }: {
    label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label} *</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Checkout</h1>
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">ব্যক্তিগত তথ্য</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">পুরো নাম *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors" placeholder="আপনার পুরো নাম লিখুন" maxLength={100} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">ফোন নম্বর *</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors" placeholder="01XXXXXXXXX" maxLength={15} />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-display font-semibold text-lg mb-4">ডেলিভারি ঠিকানা</h2>
                <div className="space-y-4">
                  <SelectField
                    label="বিভাগ"
                    value={form.division}
                    onChange={(v) => setForm({ ...form, division: v, district: "", upazila: "" })}
                    options={divisionNames}
                    placeholder="বিভাগ নির্বাচন করুন"
                  />
                  <SelectField
                    label="জেলা"
                    value={form.district}
                    onChange={(v) => setForm({ ...form, district: v, upazila: "" })}
                    options={districts}
                    placeholder="জেলা নির্বাচন করুন"
                    disabled={!form.division}
                  />
                  <SelectField
                    label="উপজেলা"
                    value={form.upazila}
                    onChange={(v) => setForm({ ...form, upazila: v })}
                    options={upazilas}
                    placeholder="উপজেলা নির্বাচন করুন"
                    disabled={!form.district}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1.5">বিস্তারিত ঠিকানা *</label>
                    <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors min-h-[100px] resize-none" placeholder="বাড়ি নং, রোড নং, এলাকার নাম ইত্যাদি" maxLength={500} />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-display font-semibold text-lg mb-4">পেমেন্ট পদ্ধতি</h2>
                <div className="border border-foreground bg-secondary/30 p-4 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-4 border-foreground" />
                  <div>
                    <p className="font-medium text-sm">ক্যাশ অন ডেলিভারি (COD)</p>
                    <p className="text-xs text-muted-foreground">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</p>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-foreground text-background py-4 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50">
                {submitting ? "অর্ডার প্লেস হচ্ছে..." : `অর্ডার প্লেস করুন — ৳${finalTotal.toLocaleString()}`}
              </button>
            </form>

            <div className="lg:col-span-1">
              <div className="bg-secondary/50 p-6 sticky top-24">
                <h2 className="font-display font-semibold text-lg mb-4">অর্ডার সামারি</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                      <div className="w-14 h-18 bg-secondary shrink-0 overflow-hidden">
                        <img src={getImage(item)} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium shrink-0">৳{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-accent/10 px-3 py-2">
                      <span className="text-sm font-medium text-accent">{appliedCoupon}</span>
                      <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-foreground">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1 border border-border px-3 py-2 bg-background text-sm" placeholder="কুপন কোড" maxLength={20} />
                      <button type="button" onClick={applyCoupon} className="px-4 py-2 border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors">Apply</button>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">সাবটোটাল</span><span>৳{subtotal.toLocaleString()}</span></div>
                  {discount > 0 && <div className="flex justify-between text-accent"><span>ডিসকাউন্ট</span><span>-৳{discount.toLocaleString()}</span></div>}
                  <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি চার্জ {form.division ? `(${form.division})` : ""}</span><span>৳{shippingCharge}</span></div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-display font-semibold">মোট</span>
                    <span className="font-display font-bold text-lg">৳{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
