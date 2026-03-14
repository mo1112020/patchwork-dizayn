-- =============================================================================
-- Rug Weaver Pro – Full schema for a NEW Supabase project
-- Run this once in Supabase Dashboard → SQL Editor → New query → paste → Run
-- =============================================================================

-- 1) Function to update updated_at on tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2) Profiles table (user data, synced from auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3) Designs table
CREATE TABLE public.designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Design',
  width NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  patches JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_area NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own designs" ON public.designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own designs" ON public.designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own designs" ON public.designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own designs" ON public.designs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON public.designs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) Rug textures table + storage bucket
CREATE TABLE public.rug_textures (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Genel',
  image_path TEXT,
  hex TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX rug_textures_code_key ON public.rug_textures (code);
ALTER TABLE public.rug_textures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rug textures" ON public.rug_textures FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert rug textures" ON public.rug_textures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rug textures" ON public.rug_textures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete rug textures" ON public.rug_textures FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_rug_textures_updated_at BEFORE UPDATE ON public.rug_textures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

-- Storage bucket for rug texture (and hero) images
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('rug-textures', 'rug-textures', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
    ON CONFLICT (id) DO NOTHING;

    DROP POLICY IF EXISTS "Public read for rug textures" ON storage.objects;
    CREATE POLICY "Public read for rug textures" ON storage.objects FOR SELECT USING (bucket_id = 'rug-textures');

    DROP POLICY IF EXISTS "Authenticated upload rug textures" ON storage.objects;
    CREATE POLICY "Authenticated upload rug textures" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rug-textures');

    DROP POLICY IF EXISTS "Authenticated update rug textures" ON storage.objects;
    CREATE POLICY "Authenticated update rug textures" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'rug-textures');

    DROP POLICY IF EXISTS "Authenticated delete rug textures" ON storage.objects;
    CREATE POLICY "Authenticated delete rug textures" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'rug-textures');
  END IF;
END $$;

-- 5) Designer settings (single row, admin-editable)
CREATE TABLE public.designer_settings (
  id TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
  price_per_sqm NUMERIC NOT NULL DEFAULT 150,
  default_rug_width NUMERIC NOT NULL DEFAULT 2,
  default_rug_height NUMERIC NOT NULL DEFAULT 3,
  waste_allowance NUMERIC NOT NULL DEFAULT 5,
  precision_tolerance NUMERIC NOT NULL DEFAULT 2,
  grid_unit_size NUMERIC NOT NULL DEFAULT 0.1,
  canvas_grid_size INTEGER NOT NULL DEFAULT 40,
  company_email TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT 'PATCHWORK DIZAYN',
  pdf_header_text TEXT NOT NULL DEFAULT 'PROFESSIONAL RUG DESIGN • SPECIFICATION v2.5',
  default_tool_mode TEXT NOT NULL DEFAULT 'add',
  show_grid BOOLEAN NOT NULL DEFAULT true,
  show_rulers BOOLEAN NOT NULL DEFAULT true,
  show_price BOOLEAN NOT NULL DEFAULT true,
  max_rug_width NUMERIC NOT NULL DEFAULT 5,
  max_rug_height NUMERIC NOT NULL DEFAULT 5,
  thread_colors JSONB NOT NULL DEFAULT '["E8E4DC","2C2C2C","8B7355","F5F5DC","4A4A4A"]'::jsonb,
  hero_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.designer_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view designer settings" ON public.designer_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update designer settings" ON public.designer_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can insert designer settings" ON public.designer_settings FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.designer_settings (id, price_per_sqm, default_rug_width, default_rug_height, waste_allowance, precision_tolerance, grid_unit_size, canvas_grid_size)
VALUES ('default', 150, 2, 3, 5, 2, 0.1, 40)
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER update_designer_settings_updated_at BEFORE UPDATE ON public.designer_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Orders table (realtime for status updates)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  design_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update orders" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
