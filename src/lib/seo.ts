// SEO helpers for products: slugs, fallbacks and an SEO score.

export const SITE_NAME = "Device Hub";
export const SITE_URL = "https://attire10.lovable.app";

export const slugify = (input: string): string =>
  (input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export type SeoInput = {
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  seo_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  seo_keywords?: string[];
  seo_slug?: string | null;
  image_alt_text?: string;
};

/** Resolved SEO values with sensible fallbacks. */
export const resolveSeo = (p: SeoInput) => {
  const title = (p.seo_title || "").trim() || `${p.name} | ${SITE_NAME}`;
  const rawDesc = (p.meta_description || "").trim();
  const fallbackDesc = (p.description || "").replace(/\s+/g, " ").trim();
  const description =
    rawDesc ||
    (fallbackDesc
      ? fallbackDesc.slice(0, 157) + (fallbackDesc.length > 157 ? "…" : "")
      : `Buy ${p.name} from ${SITE_NAME} in Bangladesh.`);
  const slug = (p.seo_slug || "").trim() || slugify(p.name);
  const alt = (p.image_alt_text || "").trim() || p.name;
  return { title, description, slug, alt };
};

export type SeoCheck = { ok: boolean; warn?: boolean; label: string };

/** Deterministic 0-100 score plus a human checklist. */
export const scoreSeo = (p: SeoInput) => {
  const checks: SeoCheck[] = [];
  let score = 0;
  const add = (points: number, ok: boolean, label: string, warn = false) => {
    if (ok) score += points;
    checks.push({ ok, warn: !ok && warn, label });
  };

  const title = (p.seo_title || "").trim();
  const desc = (p.meta_description || "").trim();
  const kw = (p.focus_keyword || "").trim().toLowerCase();
  const slug = (p.seo_slug || "").trim();
  const alt = (p.image_alt_text || "").trim();
  const body = (p.description || "").trim();

  add(10, !!title, title ? "SEO title added" : "Add an SEO title");
  add(
    8,
    !!title && title.length >= 30 && title.length <= 60,
    !title
      ? "SEO title length not checked yet"
      : title.length > 60
        ? "SEO title is too long (keep it under 60 characters)"
        : title.length < 30
          ? "SEO title is a bit short (aim for 30-60 characters)"
          : "SEO title length is ideal",
    true,
  );
  add(10, !!desc, desc ? "Meta description added" : "Add a meta description");
  add(
    8,
    desc.length >= 150 && desc.length <= 160,
    !desc
      ? "Meta description length not checked yet"
      : desc.length > 160
        ? "Meta description is too long (keep it under 160 characters)"
        : desc.length < 150
          ? "Meta description is too short (aim for 150-160 characters)"
          : "Meta description length is ideal",
    true,
  );
  add(10, !!kw, kw ? "Focus keyword added" : "Add a focus keyword");
  add(8, !!kw && title.toLowerCase().includes(kw), kw && title.toLowerCase().includes(kw) ? "Focus keyword appears in SEO title" : "Use the focus keyword in the SEO title", true);
  add(8, !!kw && desc.toLowerCase().includes(kw), kw && desc.toLowerCase().includes(kw) ? "Focus keyword appears in meta description" : "Use the focus keyword in the meta description", true);
  add(6, !!kw && (p.name || "").toLowerCase().includes(kw), kw && (p.name || "").toLowerCase().includes(kw) ? "Focus keyword appears in product name" : "Focus keyword is not in the product name", true);
  add(8, !!slug, slug ? "SEO slug added" : "Add an SEO slug");
  add(
    6,
    !!kw && !!slug && slugify(kw).split("-").some((w) => w.length > 2 && slug.includes(w)),
    kw && slug ? "Focus keyword is reflected in the slug" : "Make the slug reflect the focus keyword",
    true,
  );
  add(
    8,
    body.length >= 150,
    body.length >= 150 ? "Product description has enough content" : "Write a longer product description (150+ characters)",
    true,
  );
  add(6, !!alt, alt ? "Image alt text added" : "Add image alt text");
  add(2, !!(p.category || "").trim(), (p.category || "").trim() ? "Product has a category" : "Set a product category");
  add(2, !!(p.brand || "").trim(), (p.brand || "").trim() ? "Brand information added" : "Add brand information");

  const keywords = (p.seo_keywords || []).filter(Boolean);
  add(
    0 + (keywords.length > 0 ? 0 : 0),
    keywords.length > 0,
    keywords.length > 0 ? `${keywords.length} SEO keyword${keywords.length > 1 ? "s" : ""} added` : "Add a few relevant SEO keywords",
    true,
  );

  return { score: Math.max(0, Math.min(100, score)), checks };
};
