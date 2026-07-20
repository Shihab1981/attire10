// Client helpers that route admin/guest writes through secured edge functions.
import { supabase } from "@/integrations/supabase/client";

const ADMIN_PASSWORD_KEY = "admin_password";

export const setAdminPassword = (pw: string) => sessionStorage.setItem(ADMIN_PASSWORD_KEY, pw);
export const getAdminPassword = () => sessionStorage.getItem(ADMIN_PASSWORD_KEY) || "";
export const clearAdminPassword = () => sessionStorage.removeItem(ADMIN_PASSWORD_KEY);

async function callAdmin(payload: Record<string, unknown>) {
  const password = getAdminPassword();
  const { data, error } = await supabase.functions.invoke("admin-api", {
    body: { ...payload, password },
  });
  if (error) throw error;
  if (data?.error) throw new Error(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
  return data;
}

export const adminApi = {
  insert: (table: string, values: any) => callAdmin({ action: "insert", table, values }).then((r) => r.data),
  update: (table: string, values: any, match: Record<string, any>) =>
    callAdmin({ action: "update", table, values, match }).then((r) => r.data),
  delete: (table: string, match: Record<string, any>) => callAdmin({ action: "delete", table, match }),
  upsert: (table: string, values: any) => callAdmin({ action: "upsert", table, values }).then((r) => r.data),
  select: (table: string, opts?: { select?: string; match?: Record<string, any> }) =>
    callAdmin({ action: "select", table, ...opts }).then((r) => r.data),
  uploadImage: async (bucket: "product-images" | "review-images", file: File, path?: string) => {
    const buf = await file.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const ext = file.name.split(".").pop() || "bin";
    const finalPath = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await callAdmin({
      action: "upload",
      bucket,
      path: finalPath,
      fileBase64: b64,
      contentType: file.type || "application/octet-stream",
    });
    return res.publicUrl as string;
  },
};
