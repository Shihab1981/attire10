
-- 1) Drop overly permissive write policies on all admin tables
DROP POLICY IF EXISTS "Coupons allow all inserts" ON public.coupons;
DROP POLICY IF EXISTS "Coupons allow all updates" ON public.coupons;
DROP POLICY IF EXISTS "Coupons allow all deletes" ON public.coupons;
DROP POLICY IF EXISTS "Coupons allow all select" ON public.coupons;

DROP POLICY IF EXISTS "Flash sales allow all inserts" ON public.flash_sales;
DROP POLICY IF EXISTS "Flash sales allow all updates" ON public.flash_sales;
DROP POLICY IF EXISTS "Flash sales allow all deletes" ON public.flash_sales;

DROP POLICY IF EXISTS "Hero slides allow all inserts" ON public.hero_slides;
DROP POLICY IF EXISTS "Hero slides allow all updates" ON public.hero_slides;
DROP POLICY IF EXISTS "Hero slides allow all deletes" ON public.hero_slides;

DROP POLICY IF EXISTS "Products allow all inserts" ON public.products;
DROP POLICY IF EXISTS "Products allow all updates" ON public.products;
DROP POLICY IF EXISTS "Products allow all deletes" ON public.products;

DROP POLICY IF EXISTS "Reviews allow all inserts" ON public.reviews;
DROP POLICY IF EXISTS "Reviews allow all updates" ON public.reviews;
DROP POLICY IF EXISTS "Reviews allow all deletes" ON public.reviews;

DROP POLICY IF EXISTS "Site settings allow all inserts" ON public.site_settings;
DROP POLICY IF EXISTS "Site settings allow all updates" ON public.site_settings;
DROP POLICY IF EXISTS "Site settings allow all deletes" ON public.site_settings;

DROP POLICY IF EXISTS "Orders allow all select" ON public.orders;
DROP POLICY IF EXISTS "Orders allow all inserts" ON public.orders;
DROP POLICY IF EXISTS "Orders allow all updates" ON public.orders;
DROP POLICY IF EXISTS "Orders allow all deletes" ON public.orders;

DROP POLICY IF EXISTS "Order items allow all select" ON public.order_items;
DROP POLICY IF EXISTS "Order items allow all inserts" ON public.order_items;
DROP POLICY IF EXISTS "Order items allow all updates" ON public.order_items;
DROP POLICY IF EXISTS "Order items allow all deletes" ON public.order_items;

-- 2) Revoke direct table write privileges for anon; keep SELECT where public read is intended.
-- Products / Hero slides / Flash sales / Reviews / Site settings: public SELECT keeps working via existing "publicly readable" policies.
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.hero_slides FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.flash_sales FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.reviews FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.site_settings FROM anon, authenticated;
REVOKE ALL ON public.coupons FROM anon, authenticated;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
-- authenticated retains SELECT on orders/order_items via existing owner-scoped policies

-- 3) Revoke EXECUTE on SECURITY DEFINER functions (trigger functions - fire via triggers only)
REVOKE ALL ON FUNCTION public.restore_stock_on_cancel() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decrease_stock_on_order() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 4) Storage: remove policies that allow public listing + public writes on public buckets.
-- Public read via getPublicUrl still works (served by CDN, not gated by storage.objects policies).
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes on product images" ON storage.objects;
DROP POLICY IF EXISTS "Review images allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Review images allow public upload" ON storage.objects;
