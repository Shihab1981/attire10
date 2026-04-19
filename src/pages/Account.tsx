import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Phone, MapPin, Package, LogOut, Edit, Trash2, Plus, Star, Loader2, Home, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name required").max(100),
  phone: z.string().trim().min(10, "Valid phone required").max(20),
});

const addressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  recipient_name: z.string().trim().min(2, "Name required").max(100),
  phone: z.string().trim().min(10, "Valid phone required").max(20),
  address_line: z.string().trim().min(5, "Address required").max(500),
});

const Account = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"profile" | "addresses" | "orders">("profile");

  useEffect(() => {
    if (!loading && !user) navigate("/auth?redirect=/account", { replace: true });
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-14">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-12">
            <div className="h-[2px] w-8 bg-accent mb-4" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">My Account</p>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">Welcome</h1>
                <p className="text-sm text-muted-foreground font-body mt-2">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 border border-border hover:border-destructive hover:text-destructive text-xs font-body font-semibold tracking-wider uppercase transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-12">
            {/* Sidebar */}
            <aside className="lg:border-r lg:border-border lg:pr-6">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {[
                  { id: "profile", label: "Profile", icon: User },
                  { id: "addresses", label: "Addresses", icon: MapPin },
                  { id: "orders", label: "Orders", icon: Package },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id as any)}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-body font-semibold tracking-wider uppercase whitespace-nowrap transition-colors ${
                      tab === item.id ? "bg-foreground text-primary-foreground" : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon size={14} /> {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <div>
              {tab === "profile" && <ProfileTab userId={user.id} email={user.email!} />}
              {tab === "addresses" && <AddressesTab userId={user.id} />}
              {tab === "orders" && <OrdersTab userId={user.id} />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ============ PROFILE TAB ============
const ProfileTab = ({ userId, email }: { userId: string; email: string }) => {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ full_name: "", phone: "" });
  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || "", phone: profile.phone || "" });
  }, [profile]);

  const update = useMutation({
    mutationFn: async () => {
      const parsed = profileSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.errors[0].message);
      const { error } = await supabase.from("profiles").upsert({ id: userId, ...parsed.data, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["profile", userId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 size={20} className="animate-spin text-accent" />;

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-xl font-bold mb-1">Personal Info</h2>
      <p className="text-xs text-muted-foreground font-body mb-6">Used to auto-fill checkout</p>

      <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-4">
        <div>
          <label className="block text-[11px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Email</label>
          <input value={email} disabled className="w-full border border-border px-4 py-3 bg-secondary/40 text-sm font-body opacity-70" />
        </div>
        <div>
          <label className="block text-[11px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Full name *</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-border pl-11 pr-4 py-3 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              maxLength={100}
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-body font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2">Phone *</label>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-border pl-11 pr-4 py-3 bg-background text-sm font-body focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              maxLength={20}
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={update.isPending}
          className="bg-foreground text-primary-foreground px-8 py-3.5 font-display font-bold text-xs tracking-wider uppercase hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {update.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save Changes
        </button>
      </form>
    </div>
  );
};

// ============ ADDRESSES TAB ============
const AddressesTab = ({ userId }: { userId: string }) => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
      const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Default address updated"); qc.invalidateQueries({ queryKey: ["addresses", userId] }); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Address deleted"); qc.invalidateQueries({ queryKey: ["addresses", userId] }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">Saved Addresses</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">Manage your shipping locations</p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 bg-foreground text-primary-foreground px-4 py-2.5 text-xs font-body font-semibold tracking-wider uppercase hover:bg-accent transition-colors"
        >
          <Plus size={14} /> Add new
        </button>
      </div>

      {isLoading ? <Loader2 size={20} className="animate-spin text-accent" /> : (
        <div className="space-y-4">
          {addresses.length === 0 && editing !== "new" && (
            <div className="border border-dashed border-border p-10 text-center">
              <Home size={28} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground font-body">No saved addresses yet</p>
            </div>
          )}

          {editing === "new" && <AddressForm userId={userId} onClose={() => setEditing(null)} />}

          {addresses.map((addr) => (
            editing === addr.id ? (
              <AddressForm key={addr.id} userId={userId} address={addr} onClose={() => setEditing(null)} />
            ) : (
              <div key={addr.id} className="border border-border p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-body font-bold tracking-wider uppercase">{addr.label}</span>
                    {addr.is_default && <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 font-body font-semibold tracking-wider uppercase flex items-center gap-1"><Star size={10} fill="currentColor" /> Default</span>}
                  </div>
                  <p className="text-sm font-body font-semibold">{addr.recipient_name}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{addr.phone}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1.5 leading-relaxed">{addr.address_line}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {!addr.is_default && (
                    <button onClick={() => setDefault.mutate(addr.id)} className="p-2 hover:bg-secondary/60 transition-colors" title="Set default">
                      <Star size={14} />
                    </button>
                  )}
                  <button onClick={() => setEditing(addr.id)} className="p-2 hover:bg-secondary/60 transition-colors" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => { if (confirm("Delete this address?")) remove.mutate(addr.id); }} className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

const AddressForm = ({ userId, address, onClose }: { userId: string; address?: any; onClose: () => void }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    label: address?.label || "Home",
    recipient_name: address?.recipient_name || "",
    phone: address?.phone || "",
    address_line: address?.address_line || "",
    is_default: address?.is_default || false,
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = addressSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.errors[0].message);

      if (form.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
      }

      const row = {
        label: parsed.data.label,
        recipient_name: parsed.data.recipient_name,
        phone: parsed.data.phone,
        address_line: parsed.data.address_line,
        is_default: form.is_default,
      };

      if (address) {
        const { error } = await supabase.from("addresses").update(row).eq("id", address.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addresses").insert({ ...row, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(address ? "Address updated" : "Address saved"); qc.invalidateQueries({ queryKey: ["addresses", userId] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="border-2 border-accent p-5 space-y-3 bg-accent/5">
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label (Home, Office...)" maxLength={40} className="border border-border px-3 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent" />
        <input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} placeholder="Recipient name *" maxLength={100} required className="border border-border px-3 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent" />
      </div>
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone *" type="tel" maxLength={20} required className="w-full border border-border px-3 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent" />
      <textarea value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} placeholder="Full address (Division, District, Upazila, House/Road...) *" maxLength={500} required rows={3} className="w-full border border-border px-3 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent resize-none" />
      <label className="flex items-center gap-2 text-xs font-body cursor-pointer">
        <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="accent-accent" />
        Set as default
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending} className="bg-foreground text-primary-foreground px-5 py-2.5 text-xs font-body font-semibold tracking-wider uppercase hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2">
          {save.isPending && <Loader2 size={12} className="animate-spin" />} Save
        </button>
        <button type="button" onClick={onClose} className="border border-border px-5 py-2.5 text-xs font-body font-semibold tracking-wider uppercase hover:bg-secondary/60 transition-colors">Cancel</button>
      </div>
    </form>
  );
};

// ============ ORDERS TAB ============
const OrdersTab = ({ userId }: { userId: string }) => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Loader2 size={20} className="animate-spin text-accent" />;

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-border p-10 text-center">
        <Package size={28} className="mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground font-body mb-4">No orders yet</p>
        <Link to="/products" className="inline-flex items-center gap-2 text-xs font-body font-semibold tracking-wider uppercase text-accent hover:underline">
          Start shopping <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const statusColor = (status: string) => {
    if (status === "delivered") return "bg-green-100 text-green-800 border-green-200";
    if (status === "shipped") return "bg-blue-100 text-blue-800 border-blue-200";
    if (status === "confirmed") return "bg-amber-100 text-amber-800 border-amber-200";
    if (status === "cancelled") return "bg-red-100 text-red-800 border-red-200";
    return "bg-secondary text-foreground border-border";
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-1">Order History</h2>
      <p className="text-xs text-muted-foreground font-body mb-6">{orders.length} {orders.length === 1 ? "order" : "orders"}</p>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <Link
            key={order.id}
            to={`/order-confirmation/${order.id}`}
            className="block border border-border hover:border-accent transition-colors p-5"
          >
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm font-display font-semibold mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <span className={`text-[10px] font-body font-bold tracking-wider uppercase px-3 py-1 border ${statusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-body">
              <span className="text-muted-foreground">{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? "s" : ""}</span>
              <span className="font-display font-bold text-base">৳{order.total_price.toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Account;
