import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { Package, ShoppingCart, Tag, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const { data: products } = useQuery({
    queryKey: ["admin-products-count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: orders } = useQuery({
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

  const stats = [
    { label: "Total Products", value: products ?? 0, icon: Package, color: "text-foreground" },
    { label: "Total Orders", value: orders ?? 0, icon: ShoppingCart, color: "text-foreground" },
    { label: "Pending Orders", value: pendingOrders ?? 0, icon: Tag, color: "text-accent" },
    { label: "Revenue", value: `৳${(revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-foreground" },
  ];

  return (
    <AdminAuthGate>
      <AdminLayout>
        <h1 className="font-display text-2xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card p-6 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <s.icon size={20} className={s.color} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="font-display text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminDashboard;
