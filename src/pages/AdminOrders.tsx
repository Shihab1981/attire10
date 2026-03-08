import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Filter, ChevronDown, ChevronUp, Phone, MapPin, Package, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statuses = ["pending", "shipped", "delivered", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
  });

  const filtered = useMemo(() => {
    let list = [...orders];

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }

    // Search by name, phone, or order id
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? db - da : da - db;
    });

    return list;
  }, [orders, statusFilter, search, sortOrder]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    statuses.forEach((s) => {
      counts[s] = orders.filter((o) => o.status === s).length;
    });
    return counts;
  }, [orders]);

  const toggleExpand = (id: string) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  return (
    <AdminAuthGate>
      <AdminLayout>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              {orders.length} total orders
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-card border border-border p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or order ID..."
              className="w-full pl-9 pr-9 py-2.5 bg-background border border-border text-sm font-body focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {["all", ...statuses].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-xs font-body font-medium px-3 py-1.5 border transition-colors whitespace-nowrap ${
                    statusFilter === s
                      ? "bg-foreground text-primary-foreground border-foreground"
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  <span className="ml-1.5 opacity-60">{statusCounts[s] ?? 0}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder((p) => (p === "desc" ? "asc" : "desc"))}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body shrink-0"
            >
              <Filter size={13} />
              {sortOrder === "desc" ? "Newest first" : "Oldest first"}
              {sortOrder === "desc" ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border">
            <Package size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-body text-sm">
              {search || statusFilter !== "all"
                ? "No orders match your filters"
                : "No orders yet"}
            </p>
            {(search || statusFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); }}
                className="mt-3 text-xs text-accent hover:text-accent/80 font-body transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((order, index) => {
                const isExpanded = expandedOrder === order.id;
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-card border border-border overflow-hidden"
                  >
                    {/* Order Header Row */}
                    <div
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 md:p-5 cursor-pointer hover:bg-secondary/20 transition-colors"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                        {/* Order ID & Date */}
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-semibold tracking-wide">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-body mt-0.5">
                            {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}
                          </p>
                        </div>

                        {/* Customer */}
                        <div className="hidden sm:block min-w-0">
                          <p className="font-medium text-sm truncate">{order.customer_name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone size={10} /> {order.customer_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        {/* Amount */}
                        <span className="font-display font-bold text-sm md:text-base">
                          ৳{order.total_price.toLocaleString()}
                        </span>

                        {/* Status Dropdown */}
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateStatus.mutate({ id: order.id, status: e.target.value });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[11px] font-medium px-2.5 py-1.5 border cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent ${statusColors[order.status] || ""}`}
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>

                        {/* Expand Icon */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} className="text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border p-4 md:p-5 bg-secondary/10">
                            <div className="grid md:grid-cols-3 gap-5 mb-5">
                              {/* Customer Info */}
                              <div>
                                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium mb-2">Customer</p>
                                <p className="font-medium text-sm">{order.customer_name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                  <Phone size={12} /> {order.customer_phone}
                                </p>
                              </div>

                              {/* Address */}
                              <div>
                                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium mb-2">Shipping Address</p>
                                <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                                  <MapPin size={12} className="mt-0.5 shrink-0" />
                                  {order.customer_address}
                                </p>
                              </div>

                              {/* Payment Summary */}
                              <div>
                                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium mb-2">Payment</p>
                                <div className="space-y-1 text-sm font-body">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>৳{order.subtotal.toLocaleString()}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-accent">
                                      <span>Discount ({order.coupon_code})</span>
                                      <span>-৳{order.discount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between font-display font-bold border-t border-border/50 pt-1">
                                    <span>Total</span>
                                    <span>৳{order.total_price.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Items Table */}
                            <div>
                              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body font-medium mb-2">
                                Order Items ({order.order_items?.length ?? 0})
                              </p>
                              <div className="bg-card border border-border overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border text-left">
                                      <th className="px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-body font-medium">Product</th>
                                      <th className="px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-body font-medium">Size</th>
                                      <th className="px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-body font-medium text-center">Qty</th>
                                      <th className="px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-body font-medium text-right">Price</th>
                                      <th className="px-3 py-2 text-[10px] tracking-[0.1em] uppercase text-muted-foreground font-body font-medium text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.order_items?.map((item: any) => (
                                      <tr key={item.id} className="border-b border-border/30">
                                        <td className="px-3 py-2.5 font-medium">{item.product_name}</td>
                                        <td className="px-3 py-2.5 text-muted-foreground">{item.size}</td>
                                        <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                                        <td className="px-3 py-2.5 text-right text-muted-foreground">৳{item.price.toLocaleString()}</td>
                                        <td className="px-3 py-2.5 text-right font-medium">৳{(item.price * item.quantity).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Result count */}
            <p className="text-xs text-muted-foreground font-body text-center pt-2">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>
        )}
      </AdminLayout>
    </AdminAuthGate>
  );
};

export default AdminOrders;
