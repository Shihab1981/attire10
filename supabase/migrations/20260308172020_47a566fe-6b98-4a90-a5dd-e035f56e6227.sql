
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  overline text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  cta_text text NOT NULL DEFAULT 'Shop Now',
  cta_link text NOT NULL DEFAULT '/products',
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero slides are publicly readable" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Hero slides allow all inserts" ON public.hero_slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Hero slides allow all updates" ON public.hero_slides FOR UPDATE USING (true);
CREATE POLICY "Hero slides allow all deletes" ON public.hero_slides FOR DELETE USING (true);
