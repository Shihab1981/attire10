// Guest checkout: validates and inserts an order + items server-side.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const Body = z.object({
  customer_name: z.string().trim().min(1).max(200),
  customer_phone: z.string().trim().min(10).max(20),
  customer_address: z.string().trim().min(3).max(1000),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    size: z.string().min(1).max(10),
    quantity: z.number().int().min(1).max(50),
  })).min(1).max(50),
  coupon_code: z.string().trim().max(50).optional().nullable(),
  shipping_charge: z.number().int().min(0).max(1000),
});

const jsonResp = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return jsonResp({ error: parsed.error.flatten() }, 400);
    const input = parsed.data;

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

    const productIds = [...new Set(input.items.map((i) => i.product_id))];
    const { data: products, error: pErr } = await sb.from("products").select("id, name, price").in("id", productIds);
    if (pErr || !products) return jsonResp({ error: "Product lookup failed" }, 400);
    const pmap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = input.items.map((i) => {
      const p = pmap.get(i.product_id);
      if (!p) throw new Error(`Product ${i.product_id} not found`);
      subtotal += p.price * i.quantity;
      return { product_id: p.id, product_name: p.name, size: i.size, quantity: i.quantity, price: p.price };
    });

    let discount = 0;
    let couponCode: string | null = null;
    if (input.coupon_code) {
      const code = input.coupon_code.toUpperCase().trim();
      const { data: coupon } = await sb.from("coupons").select("*").eq("code", code).eq("active", true).maybeSingle();
      if (coupon) {
        couponCode = coupon.code;
        discount = coupon.type === "percent" ? Math.round(subtotal * coupon.value / 100) : coupon.value;
      }
    }

    const total_price = Math.max(0, subtotal + input.shipping_charge - discount);

    const { data: order, error: oErr } = await sb.from("orders").insert({
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_address: input.customer_address,
      subtotal,
      discount,
      coupon_code: couponCode,
      total_price,
      status: "pending",
      user_id: null,
    }).select().single();
    if (oErr || !order) return jsonResp({ error: oErr?.message || "Order failed" }, 400);

    const { error: iErr } = await sb.from("order_items").insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
    if (iErr) {
      await sb.from("orders").delete().eq("id", order.id);
      return jsonResp({ error: iErr.message }, 400);
    }

    return jsonResp({ order_id: order.id });
  } catch (e) {
    return jsonResp({ error: (e as Error).message }, 500);
  }
});
