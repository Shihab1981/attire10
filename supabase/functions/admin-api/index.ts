// Admin API - password-protected proxy for all admin writes.
// All operations execute with service_role (bypassing RLS).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_TABLES = new Set([
  "products",
  "coupons",
  "flash_sales",
  "hero_slides",
  "reviews",
  "site_settings",
  "orders",
  "order_items",
]);

const jsonResp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const password = req.headers.get("x-admin-password") || body.password;
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return jsonResp({ error: "Unauthorized" }, 401);
    }

    const { action, table, values, match, select, upsert, filter } = body as {
      action: "select" | "insert" | "update" | "delete" | "upsert" | "upload" | "list_files" | "delete_file";
      table?: string;
      values?: any;
      match?: Record<string, any>;
      select?: string;
      upsert?: boolean;
      filter?: { column: string; op: string; value: any }[];
    };

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Storage upload (admin)
    if (action === "upload") {
      const { bucket, path, fileBase64, contentType } = body as any;
      if (!bucket || !path || !fileBase64) return jsonResp({ error: "Missing fields" }, 400);
      const bin = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
      const { error } = await sb.storage.from(bucket).upload(path, bin, {
        contentType: contentType || "application/octet-stream",
        upsert: true,
      });
      if (error) return jsonResp({ error: error.message }, 400);
      const { data } = sb.storage.from(bucket).getPublicUrl(path);
      return jsonResp({ publicUrl: data.publicUrl, path });
    }

    if (!table || !ALLOWED_TABLES.has(table)) {
      return jsonResp({ error: "Table not allowed" }, 400);
    }

    let q: any = sb.from(table);

    if (action === "select") {
      q = q.select(select || "*");
      if (filter) for (const f of filter) q = q.filter(f.column, f.op, f.value);
      if (match) q = q.match(match);
      const { data, error } = await q;
      if (error) return jsonResp({ error: error.message }, 400);
      return jsonResp({ data });
    }
    if (action === "insert") {
      const { data, error } = await q.insert(values).select().single();
      if (error) return jsonResp({ error: error.message }, 400);
      return jsonResp({ data });
    }
    if (action === "update") {
      q = q.update(values);
      if (match) q = q.match(match);
      const { data, error } = await q.select();
      if (error) return jsonResp({ error: error.message }, 400);
      return jsonResp({ data });
    }
    if (action === "upsert") {
      const { data, error } = await q.upsert(values).select();
      if (error) return jsonResp({ error: error.message }, 400);
      return jsonResp({ data });
    }
    if (action === "delete") {
      q = q.delete();
      if (match) q = q.match(match);
      const { error } = await q;
      if (error) return jsonResp({ error: error.message }, 400);
      return jsonResp({ ok: true });
    }

    return jsonResp({ error: "Unknown action" }, 400);
  } catch (e) {
    return jsonResp({ error: (e as Error).message }, 500);
  }
});
