
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Site settings allow all updates" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "Site settings allow all inserts" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Site settings allow all deletes" ON public.site_settings FOR DELETE USING (true);

INSERT INTO public.site_settings (key, value) VALUES
('announcement_text', '✦ Free Shipping on Orders Over ৳2,000 ✦ New Arrivals Every Week ✦ Premium Quality Fabrics ✦ 100% Authentic Products');
