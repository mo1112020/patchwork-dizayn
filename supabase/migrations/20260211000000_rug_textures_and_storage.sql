-- Rug textures table: metadata for texture photos (images stored in storage bucket)
-- id is stable string (e.g. tex-ivory) so existing designs and patches keep working
CREATE TABLE public.rug_textures (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  image_path TEXT,
  hex TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique code for admin UX
CREATE UNIQUE INDEX rug_textures_code_key ON public.rug_textures (code);

-- Enable RLS
ALTER TABLE public.rug_textures ENABLE ROW LEVEL SECURITY;

-- Everyone can read textures (designer needs them)
CREATE POLICY "Anyone can view rug textures"
ON public.rug_textures FOR SELECT
USING (true);

-- Only authenticated users can insert/update/delete (admin page will use this; restrict to admin role later)
CREATE POLICY "Authenticated users can insert rug textures"
ON public.rug_textures FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update rug textures"
ON public.rug_textures FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete rug textures"
ON public.rug_textures FOR DELETE
TO authenticated
USING (true);

-- Timestamp trigger
CREATE TRIGGER update_rug_textures_updated_at
BEFORE UPDATE ON public.rug_textures
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default textures (image_path can be set when admin uploads images)
INSERT INTO public.rug_textures (id, name, code, hex, display_order) VALUES
  ('tex-ivory', 'Fildişi', 'TX-101', '#F5F5DC', 1),
  ('tex-cream', 'Krem', 'TX-102', '#FFFDD0', 2),
  ('tex-beige', 'Bej', 'TX-103', '#D4C4A8', 3),
  ('tex-charcoal', 'Kömür', 'TX-104', '#36454F', 4),
  ('tex-black', 'Siyah', 'TX-105', '#1A1A1A', 5),
  ('tex-terracotta', 'Terracotta', 'TX-201', '#C96B4A', 6),
  ('tex-rust', 'Pas', 'TX-202', '#B7410E', 7),
  ('tex-amber', 'Kehribar', 'TX-203', '#D4A03C', 8),
  ('tex-navy', 'Lacivert', 'TX-301', '#1B3A57', 9),
  ('tex-sage', 'Adaçayı', 'TX-302', '#87A878', 10),
  ('tex-olive', 'Zeytin', 'TX-303', '#6B7B3E', 11),
  ('tex-burgundy', 'Bordo', 'TX-401', '#722F37', 12),
  ('tex-coral', 'Mercan', 'TX-501', '#E07A5F', 13),
  ('tex-mustard', 'Hardal', 'TX-502', '#E4B429', 14);

-- Storage bucket for rug texture images (create if storage schema exists)
-- If this fails, create bucket "rug-textures" in Dashboard: Storage → New bucket → name: rug-textures, Public: on
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'rug-textures',
      'rug-textures',
      true,
      5242880,
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    )
    ON CONFLICT (id) DO NOTHING;

    -- Public read for all files in rug-textures
    DROP POLICY IF EXISTS "Public read for rug textures" ON storage.objects;
    CREATE POLICY "Public read for rug textures"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'rug-textures');

    -- Authenticated users can upload/update/delete (for admin)
    DROP POLICY IF EXISTS "Authenticated upload rug textures" ON storage.objects;
    CREATE POLICY "Authenticated upload rug textures"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'rug-textures');

    DROP POLICY IF EXISTS "Authenticated update rug textures" ON storage.objects;
    CREATE POLICY "Authenticated update rug textures"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'rug-textures');

    DROP POLICY IF EXISTS "Authenticated delete rug textures" ON storage.objects;
    CREATE POLICY "Authenticated delete rug textures"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'rug-textures');
  END IF;
END $$;
