-- Single-row table for designer page settings (controlled by admin)
CREATE TABLE public.designer_settings (
  id TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
  price_per_sqm NUMERIC NOT NULL DEFAULT 150,
  default_rug_width NUMERIC NOT NULL DEFAULT 2,
  default_rug_height NUMERIC NOT NULL DEFAULT 3,
  waste_allowance NUMERIC NOT NULL DEFAULT 5,
  precision_tolerance NUMERIC NOT NULL DEFAULT 2,
  grid_unit_size NUMERIC NOT NULL DEFAULT 0.1,
  canvas_grid_size INTEGER NOT NULL DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.designer_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read (designer page needs it)
CREATE POLICY "Anyone can view designer settings"
ON public.designer_settings FOR SELECT
USING (true);

-- Only authenticated users can update (admin will sign in via Supabase Auth)
CREATE POLICY "Authenticated users can update designer settings"
ON public.designer_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can insert designer settings"
ON public.designer_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Seed single row
INSERT INTO public.designer_settings (id, price_per_sqm, default_rug_width, default_rug_height, waste_allowance, precision_tolerance, grid_unit_size, canvas_grid_size)
VALUES ('default', 150, 2, 3, 5, 2, 0.1, 40);

-- Timestamp trigger
CREATE TRIGGER update_designer_settings_updated_at
BEFORE UPDATE ON public.designer_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
