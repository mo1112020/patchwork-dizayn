-- Hero section images (home page): array of image URLs. Admin uploads to storage and URLs are stored here.
ALTER TABLE public.designer_settings
  ADD COLUMN IF NOT EXISTS hero_images jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Storage bucket for hero section images (home page)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'hero-images',
      'hero-images',
      true,
      5242880,
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO NOTHING;

    DROP POLICY IF EXISTS "Public read for hero images" ON storage.objects;
    CREATE POLICY "Public read for hero images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'hero-images');

    DROP POLICY IF EXISTS "Authenticated upload hero images" ON storage.objects;
    CREATE POLICY "Authenticated upload hero images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'hero-images');

    DROP POLICY IF EXISTS "Authenticated update hero images" ON storage.objects;
    CREATE POLICY "Authenticated update hero images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'hero-images');

    DROP POLICY IF EXISTS "Authenticated delete hero images" ON storage.objects;
    CREATE POLICY "Authenticated delete hero images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'hero-images');
  END IF;
END $$;
