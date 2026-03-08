import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const coupons: Record<string, { type: "percent" | "flat"; value: number }> = {
  WELCOME10: { type: "percent", value: 10 },
  FLAT200: { type: "flat", value: 200 },
};

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = totalPrice();

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = coupons[code];
    if (!coupon) {
      toast.error("Invalid coupon code");
      return;
    }
    setAppliedCoupon(code);
    const d = coupon.type === "percent" ? Math.round(subtotal * coupon.value / 100) : coupon.value;
    setDiscount(d);
    toast.success(`Coupon "${code}" applied! You save ৳${d.toLocaleString()}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
  };

  const finalTotal = Math.max(0, subtotal - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.phone.trim().length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setOrderPlaced(true);
    clearCart();
  };

  if (items.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <CheckCircle size={64} className="mx-auto text-accent mb-6" />
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We'll contact you at {form.phone} to confirm your delivery.
            </p>
            <Link
              to="/"
              className="inline-block bg-foreground text-background px-8 py-3 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors"
                      placeholder="Enter your full name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors"
                      placeholder="01XXXXXXXXX"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Delivery Address *</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full border border-border px-4 py-3 bg-background text-sm focus:outline-none focus:border-foreground transition-colors min-h-[100px] resize-none"
                      placeholder="Full delivery address"
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Payment Method</h2>
                <div className="border border-foreground bg-secondary/30 p-4 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-4 border-foreground" />
                  <div>
                    <p className="font-medium text-sm">Cash on Delivery (COD)</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-foreground text-background py-4 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Place Order — ৳{finalTotal.toLocaleString()}
              </button>
            </form>

            <div className="lg:col-span-1">
              <div className="bg-secondary/50 p-6 sticky top-24">
                <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                      <div className="w-14 h-18 bg-secondary shrink-0 overflow-hidden">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Size: {item.size} × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium shrink-0">
                        ৳{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-border pt-4 mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-accent/10 px-3 py-2">
                      <span className="text-sm font-medium text-accent">{appliedCoupon}</span>
                      <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-foreground">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 border border-border px-3 py-2 bg-background text-sm"
                        placeholder="Coupon code"
                        maxLength={20}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="px-4 py-2 border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Discount</span>
                      <span>-৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">Free</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-display font-semibold">Total</span>
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
