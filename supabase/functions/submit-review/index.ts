// Public review submission with optional image uploads.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const Body = z.object({
  product_id: z.string().uuid(),
  reviewer_name: z.string().trim().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
  images: z.array(z.object({
    base64: z.string().max(8_000_000), // ~6MB decoded
    contentType: z.string().max(100),
  })).max(4).optional().default([]),
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
    const urls: string[] = [];
    for (const img of input.images) {
      if (!img.contentType.startsWith("image/")) continue;
      const ext = img.contentType.split("/")[1]?.replace("+xml", "") || "jpg";
      const path = `${input.product_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const bin = Uint8Array.from(atob(img.base64), (c) => c.charCodeAt(0));
      const { error } = await sb.storage.from("review-images").upload(path, bin, { contentType: img.contentType });
      if (error) return jsonResp({ error: error.message }, 400);
      const { data } = sb.storage.from("review-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    const { error } = await sb.from("reviews").insert({
      product_id: input.product_id,
      reviewer_name: input.reviewer_name,
      rating: input.rating,
      comment: input.comment,
      images: urls,
    });
    if (error) return jsonResp({ error: error.message }, 400);
    return jsonResp({ ok: true });
  } catch (e) {
    return jsonResp({ error: (e as Error).message }, 500);
  }
});
