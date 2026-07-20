// Public order tracking by order ID or phone number (limited fields).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  query: z.string().trim().min(3).max(100),
});

const jsonResp = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return jsonResp({ error: "Invalid input" }, 400);
    const q = parsed.data.query;

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let order: any = null;
    // Try UUID
    if (/^[0-9a-f-]{36}$/i.test(q)) {
      const { data } = await sb.from("orders").select("*").eq("id", q).maybeSingle();
      order = data;
    }
    // Short ID (first 8)
    if (!order && /^[0-9a-f]{8}$/i.test(q)) {
      const { data } = await sb.from("orders").select("*").ilike("id", `${q.toLowerCase()}%`).limit(1).maybeSingle();
      order = data;
    }
    // By phone (latest)
    if (!order) {
      const { data } = await sb.from("orders").select("*").eq("customer_phone", q).order("created_at", { ascending: false }).limit(1).maybeSingle();
      order = data;
    }

    if (!order) return jsonResp({ order: null, items: [] });
    const { data: items } = await sb.from("order_items").select("*").eq("order_id", order.id);
    return jsonResp({ order, items: items || [] });
  } catch (e) {
    return jsonResp({ error: (e as Error).message }, 500);
  }
});
