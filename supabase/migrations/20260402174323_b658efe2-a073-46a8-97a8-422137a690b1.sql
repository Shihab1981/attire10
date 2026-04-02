ALTER TABLE public.reviews ADD COLUMN admin_reply text DEFAULT NULL;
ALTER TABLE public.reviews ADD COLUMN admin_reply_at timestamp with time zone DEFAULT NULL;

CREATE POLICY "Reviews allow all updates" ON public.reviews FOR UPDATE TO public USING (true);
