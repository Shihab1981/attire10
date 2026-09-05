ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS focus_keyword text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS seo_slug text,
  ADD COLUMN IF NOT EXISTS image_alt_text text NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS products_seo_slug_key ON public.products (seo_slug) WHERE seo_slug IS NOT NULL AND seo_slug <> '';