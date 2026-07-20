// Public coupon validation (server-side).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.number().int().min(0),
});

const jsonResp = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return jsonResp({ error: "Invalid input" }, 400);
    const { code, subtotal } = parsed.data;
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("coupons").select("code,type,value,expires_at,active").eq("code", code.toUpperCase()).eq("active", true).maybeSingle();
    if (!data) return jsonResp({ error: "Invalid or expired coupon code" }, 404);
    if (data.expires_at && new Date(data.expires_at) < new Date()) return jsonResp({ error: "Coupon expired" }, 404);
    const discount = data.type === "percent" ? Math.round(subtotal * data.value / 100) : data.value;
    return jsonResp({ code: data.code, discount });
  } catch (e) {
    return jsonResp({ error: (e as Error).message }, 500);
  }
});
