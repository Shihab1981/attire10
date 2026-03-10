
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    UPDATE public.products p
    SET stock_quantity = p.stock_quantity + oi.quantity,
        in_stock = true
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_restore_stock_on_cancel
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.restore_stock_on_cancel();
