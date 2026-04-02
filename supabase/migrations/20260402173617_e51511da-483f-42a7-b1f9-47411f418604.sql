
ALTER TABLE public.reviews ADD COLUMN images text[] NOT NULL DEFAULT '{}';

INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

CREATE POLICY "Review images allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'review-images');

CREATE POLICY "Review images allow public upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'review-images');
