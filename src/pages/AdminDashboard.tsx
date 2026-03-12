import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Package, ShoppingCart, Tag, DollarSign, TrendingUp, Clock, AlertTriangle, ArrowUpRight, Eye, Megaphone, Save, ImageIcon, Upload, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format, subDays, startOfDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { categories as defaultCategories } from "@/data/products";
import { useCategories, type CategoryItem } from "@/hooks/useCategories";

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(45, 93%, 47%)",
  shipped: "hsl(217, 91%, 60%)",
  delivered: "hsl(142, 71%, 45%)",
  cancelled: "hsl(0, 84%, 60%)",
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementLoaded, setAnnouncementLoaded] = useState(false);
  const { categories: allCategories, extraCategories } = useCategories();
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const { data: products } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: totalOrders } = useQuery({
    queryKey: ["admin-orders-count"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ["admin-pending-orders"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending");
      return count ?? 0;
    },
  });

  const { data: revenue } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("total_price").neq("status", "cancelled");
      return data?.reduce((sum, o) => sum + o.total_price, 0) ?? 0;
    },
  });

  // Recent orders
  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_phone, total_price, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Revenue last 7 days
  const { data: revenueChart = [] } = useQuery({
    queryKey: ["admin-revenue-chart"],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 6).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("total_price, created_at")
        .neq("status", "cancelled")
        .gte("created_at", sevenDaysAgo);
      if (error) throw error;

      // Group by day
      const dayMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "MMM dd");
        dayMap[day] = 0;
      }
      data?.forEach((o) => {
        const day = format(new Date(o.created_at), "MMM dd");
        if (dayMap[day] !== undefined) dayMap[day] += o.total_price;
      });

      return Object.entries(dayMap).map(([name, amount]) => ({ name, amount }));
    },
  });

  // Order status breakdown
  const { data: statusBreakdown = [] } = useQuery({
    queryKey: ["admin-status-breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("status");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach((o) => {
        counts[o.status] = (counts[o.status] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  // Low stock products
  const { data: outOfStock = [] } = useQuery({
    queryKey: ["admin-out-of-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, in_stock")
        .eq("in_stock", false)
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Today's orders
  const { data: todayOrders } = useQuery({
    queryKey: ["admin-today-orders"],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);
      return count ?? 0;
    },
  });

  // Today's revenue
  const { data: todayRevenue } = useQuery({
    queryKey: ["admin-today-revenue"],
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const { data } = await supabase
        .from("orders")
        .select("total_price")
        .neq("status", "cancelled")
        .gte("created_at", today);
      return data?.reduce((sum, o) => sum + o.total_price, 0) ?? 0;
    },
  });
  // Announcement text
  useQuery({
    queryKey: ["admin-announcement"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "announcement_text")
        .maybeSingle();
      if (data?.value && !announcementLoaded) {
        setAnnouncementText(data.value);
        setAnnouncementLoaded(true);
      }
      return data?.value || "";
    },
  });

  const saveAnnouncement = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: text, updated_at: new Date().toISOString() })
        .eq("key", "announcement_text");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement-text"] });
      toast.success("Announcement updated!");
    },
    onError: () => toast.error("Failed to update"),
  });

  // Category images
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [categoryImagesLoaded, setCategoryImagesLoaded] = useState(false);
  const categoryFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Category customizations (name & description)
  const [categoryCustomizations, setCategoryCustomizations] = useState<Record<string, { name?: string; description?: string }>>({});
  const [categoryCustomizationsLoaded, setCategoryCustomizationsLoaded] = useState(false);

  useQuery({
    queryKey: ["admin-category-images"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "category_images")
        .maybeSingle();
      const parsed = data?.value ? JSON.parse(data.value) : {};
      if (!categoryImagesLoaded) {
        setCategoryImages(parsed);
        setCategoryImagesLoaded(true);
      }
      return parsed;
    },
  });

  useQuery({
    queryKey: ["admin-category-customizations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "category_customizations")
        .maybeSingle();
      const parsed = data?.value ? JSON.parse(data.value) : {};
      if (!categoryCustomizationsLoaded) {
        setCategoryCustomizations(parsed);
        setCategoryCustomizationsLoaded(true);
      }
      return parsed;
    },
  });

  const handleCategoryImageUpload = async (slug: string, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `categories/${slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file);
    if (uploadError) {
      toast.error("Upload failed");
      return;
    }
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);
    const newImages = { ...categoryImages, [slug]: urlData.publicUrl };
    setCategoryImages(newImages);
    const { error } = await supabase
      .from("site_settings")
      .update({ value: JSON.stringify(newImages), updated_at: new Date().toISOString() })
      .eq("key", "category_images");
    if (error) {
      toast.error("Failed to save");
    } else {
      queryClient.invalidateQueries({ queryKey: ["category-images"] });
      toast.success(`${slug} image updated!`);
    }
  };

  const saveCategoryCustomizations = useMutation({
    mutationFn: async (customizations: Record<string, { name?: string; description?: string }>) => {
      const value = JSON.stringify(customizations);
      // Try update first, then upsert
      const { data: existing } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "category_customizations")
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", "category_customizations");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "category_customizations", value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-customizations"] });
      toast.success("Category details updated!");
    },
    onError: () => toast.error("Failed to save"),
  });

  const stats = [
    { label: "Total Revenue", value: `৳${(revenue ?? 0).toLocaleString()}`, icon: DollarSign, accent: true },
    { label: "Total Orders", value: totalOrders ?? 0, icon: ShoppingCart, accent: false },
    { label: "Pending Orders", value: pendingOrders ?? 0, icon: Clock, accent: false },
    { label: "Today's Orders", value: todayOrders ?? 0, icon: TrendingUp, accent: false },
    { label: "Total Products", value: products ?? 0, icon: Package, accent: false },
    { label: "Out of Stock", value: outOfStock.length, icon: AlertTriangle, accent: false },
  ];

  const statusLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <AdminAuthGate>
      <AdminLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Overview of your store performance
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-body hidden md:block">
            {format(new Date(), "EEEE, dd MMMM yyyy")}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`p-4 md:p-5 border border-border ${
                s.accent ? "bg-foreground text-primary-foreground" : "bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <s.icon size={16} className={s.accent ? "text-primary-foreground/60" : "text-muted-foreground"} />
                <span className={`text-[10px] tracking-[0.1em] uppercase font-body ${s.accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              <p className={`font-display text-xl md:text-2xl font-bold ${s.accent ? "" : ""}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Announcement Bar Editor */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border p-5 md:p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Megaphone size={16} className="text-accent" />
            <h2 className="font-display font-bold text-base">Announcement Bar</h2>
            <span className="text-[10px] text-muted-foreground font-body ml-1">হেডারের উপরে যে টেক্সট মুভ করে</span>
          </div>
          <div className="flex gap-3">
            <input
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="flex-1 border border-border px-4 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent transition-colors"
              placeholder="✦ Free Shipping on Orders Over ৳2,000 ✦ ..."
              maxLength={500}
            />
            <button
              onClick={() => saveAnnouncement.mutate(announcementText)}
              disabled={saveAnnouncement.isPending}
              className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-sm font-display font-semibold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 shrink-0"
            >
              <Save size={14} />
              {saveAnnouncement.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>

        {/* Category Editor */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="bg-card border border-border p-5 md:p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon size={16} className="text-accent" />
              <h2 className="font-display font-bold text-base">Category Management</h2>
              <span className="text-[10px] text-muted-foreground font-body ml-1">ছবি, নাম ও বিবরণ পরিবর্তন করুন</span>
            </div>
            <button
              onClick={() => saveCategoryCustomizations.mutate(categoryCustomizations)}
              disabled={saveCategoryCustomizations.isPending}
              className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs font-display font-semibold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              <Save size={12} />
              {saveCategoryCustomizations.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Add New Category */}
          <div className="flex flex-col sm:flex-row gap-2 mb-5 p-3 border border-dashed border-border bg-secondary/20">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 border border-border px-3 py-2 bg-background text-xs font-display font-semibold focus:outline-none focus:border-accent transition-colors"
              placeholder="New category name (e.g. Jackets)"
            />
            <input
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              className="flex-1 border border-border px-3 py-2 bg-background text-[11px] font-body focus:outline-none focus:border-accent transition-colors"
              placeholder="Description (e.g. Winter & Casual)"
            />
            <button
              onClick={async () => {
                if (!newCatName.trim()) { toast.error("Category name required"); return; }
                const slug = newCatName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                if (allCategories.some(c => c.slug === slug)) { toast.error("Category already exists"); return; }
                const newCat: CategoryItem = { slug, name: newCatName.trim(), image: "/placeholder.svg", description: newCatDesc.trim() };
                const updated = [...extraCategories, newCat];
                const { data: existing } = await supabase.from("site_settings").select("key").eq("key", "extra_categories").maybeSingle();
                if (existing) {
                  await supabase.from("site_settings").update({ value: JSON.stringify(updated), updated_at: new Date().toISOString() }).eq("key", "extra_categories");
                } else {
                  await supabase.from("site_settings").insert({ key: "extra_categories", value: JSON.stringify(updated) });
                }
                queryClient.invalidateQueries({ queryKey: ["extra-categories"] });
                setNewCatName(""); setNewCatDesc("");
                toast.success(`"${newCat.name}" category added!`);
              }}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2 text-xs font-display font-semibold hover:bg-accent/90 transition-colors shrink-0"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {allCategories.map((cat) => {
              const isExtra = extraCategories.some((e: CategoryItem) => e.slug === cat.slug);
              return (
              <div key={cat.slug} className="space-y-2">
                <div className="group relative">
                  <div className="aspect-[3/4] overflow-hidden border border-border bg-secondary/30">
                    <img
                      src={categoryImages[cat.slug] || cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { categoryFileRefs.current[cat.slug] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCategoryImageUpload(cat.slug, file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => categoryFileRefs.current[cat.slug]?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload size={18} className="text-primary-foreground mb-1" />
                    <span className="text-[10px] text-primary-foreground font-body font-medium">Change</span>
                  </button>
                  {isExtra && (
                    <button
                      onClick={async () => {
                        const updated = extraCategories.filter((e: CategoryItem) => e.slug !== cat.slug);
                        await supabase.from("site_settings").update({ value: JSON.stringify(updated), updated_at: new Date().toISOString() }).eq("key", "extra_categories");
                        queryClient.invalidateQueries({ queryKey: ["extra-categories"] });
                        toast.success(`"${cat.name}" removed`);
                      }}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <input
                  value={categoryCustomizations[cat.slug]?.name ?? cat.name}
                  onChange={(e) =>
                    setCategoryCustomizations((prev) => ({
                      ...prev,
                      [cat.slug]: { ...prev[cat.slug], name: e.target.value },
                    }))
                  }
                  className="w-full border border-border px-2.5 py-1.5 bg-background text-xs font-display font-semibold focus:outline-none focus:border-accent transition-colors"
                  placeholder="Category Name"
                />
                <input
                  value={categoryCustomizations[cat.slug]?.description ?? cat.description}
                  onChange={(e) =>
                    setCategoryCustomizations((prev) => ({
                      ...prev,
                      [cat.slug]: { ...prev[cat.slug], description: e.target.value },
                    }))
                  }
                  className="w-full border border-border px-2.5 py-1.5 bg-background text-[11px] font-body text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  placeholder="Description"
                />
                {isExtra && <span className="text-[9px] text-accent font-body">Custom category</span>}
              </div>
              );
            })}
          </div>
        </motion.div>
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 bg-card border border-border p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-base">Revenue Overview</h2>
                <p className="text-xs text-muted-foreground font-body mt-0.5">Last 7 days</p>
              </div>
              <TrendingUp size={18} className="text-muted-foreground" />
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart} barSize={28}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "2px",
                      fontSize: "12px",
                      fontFamily: "var(--font-body)",
                    }}
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Order Status Pie */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-4 bg-card border border-border p-5 md:p-6"
          >
            <h2 className="font-display font-bold text-base mb-1">Order Status</h2>
            <p className="text-xs text-muted-foreground font-body mb-4">Breakdown by status</p>
            {statusBreakdown.length > 0 ? (
              <>
                <div className="h-[160px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "2px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {statusBreakdown.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs font-body">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name] }} />
                      <span className="text-muted-foreground">{statusLabel(s.name)}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No orders yet</p>
            )}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-8 bg-card border border-border"
          >
            <div className="flex items-center justify-between p-5 md:p-6 pb-0 md:pb-0">
              <h2 className="font-display font-bold text-base">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-body"
              >
                View All <ArrowUpRight size={12} />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-5 md:px-6 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">Order</th>
                      <th className="px-3 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">Customer</th>
                      <th className="px-3 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">Amount</th>
                      <th className="px-3 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">Status</th>
                      <th className="px-3 py-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                        <td className="px-5 md:px-6 py-3.5 font-mono text-xs font-medium">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="font-medium text-sm">{order.customer_name}</p>
                          <p className="text-[11px] text-muted-foreground">{order.customer_phone}</p>
                        </td>
                        <td className="px-3 py-3.5 font-display font-semibold">
                          ৳{order.total_price.toLocaleString()}
                        </td>
                        <td className="px-3 py-3.5">
                          <span className={`text-[10px] font-medium px-2 py-1 ${statusBadge(order.status)}`}>
                            {statusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "dd MMM, hh:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No orders yet</p>
            )}
          </motion.div>

          {/* Out of Stock Alert */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-4 bg-card border border-border p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base">Stock Alerts</h2>
              <Link
                to="/admin/products"
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-body"
              >
                Manage <ArrowUpRight size={12} />
              </Link>
            </div>
            {outOfStock.length > 0 ? (
              <div className="space-y-3">
                {outOfStock.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/10">
                    <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium leading-tight">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{p.category.replace("-", " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">All products in stock</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-5 border-t border-border">
              <h3 className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/admin/products"
                  className="flex items-center gap-2 text-sm font-body py-2 px-3 hover:bg-secondary/50 transition-colors w-full"
                >
                  <Package size={14} className="text-muted-foreground" />
                  Add New Product
                </Link>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-2 text-sm font-body py-2 px-3 hover:bg-secondary/50 transition-colors w-full"
                >
                  <Eye size={14} className="text-muted-foreground" />
                  View All Orders
                </Link>
                <Link
                  to="/admin/coupons"
                  className="flex items-center gap-2 text-sm font-body py-2 px-3 hover:bg-secondary/50 transition-colors w-full"
                >
                  <Tag size={14} className="text-muted-foreground" />
                  Create Coupon
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminDashboard;
