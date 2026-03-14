-- Admin-defined thread (ip) colors for designer; stored as hex codes without # (e.g. E8E4DC)
ALTER TABLE public.designer_settings
  ADD COLUMN IF NOT EXISTS thread_colors jsonb NOT NULL DEFAULT '["E8E4DC","2C2C2C","8B7355","F5F5DC","4A4A4A"]'::jsonb;
