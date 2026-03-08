
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  original_price INTEGER,
  image_url TEXT NOT NULL DEFAULT '',
  sizes TEXT[] NOT NULL DEFAULT '{"S","M","L","XL","XXL"}',
  fabric TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  trending BOOLEAN NOT NULL DEFAULT false,
  new_arrival BOOLEAN NOT NULL DEFAULT false,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  coupon_code TEXT,
  total_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent',
  value INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (policies allow all for now since admin uses simple password)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Public read access for products (storefront)
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products allow all inserts" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products allow all updates" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products allow all deletes" ON public.products FOR DELETE USING (true);

-- Orders: allow inserts from storefront, full access for admin
CREATE POLICY "Orders allow all select" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders allow all inserts" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders allow all updates" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Orders allow all deletes" ON public.orders FOR DELETE USING (true);

-- Order items: same as orders
CREATE POLICY "Order items allow all select" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Order items allow all inserts" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order items allow all deletes" ON public.order_items FOR DELETE USING (true);

-- Coupons: public read for validation, full access for admin
CREATE POLICY "Coupons allow all select" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Coupons allow all inserts" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Coupons allow all updates" ON public.coupons FOR UPDATE USING (true);
CREATE POLICY "Coupons allow all deletes" ON public.coupons FOR DELETE USING (true);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
