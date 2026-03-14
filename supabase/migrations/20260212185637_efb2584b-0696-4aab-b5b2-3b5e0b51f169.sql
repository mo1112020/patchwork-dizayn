
-- Add new admin-controllable columns to designer_settings
ALTER TABLE public.designer_settings
  ADD COLUMN IF NOT EXISTS company_email text NOT NULL DEFAULT 'ma6118923@gmail.com',
  ADD COLUMN IF NOT EXISTS company_name text NOT NULL DEFAULT 'PATCHWORK DIZAYN',
  ADD COLUMN IF NOT EXISTS pdf_header_text text NOT NULL DEFAULT 'PROFESSIONAL RUG DESIGN • SPECIFICATION v2.5',
  ADD COLUMN IF NOT EXISTS default_tool_mode text NOT NULL DEFAULT 'add',
  ADD COLUMN IF NOT EXISTS show_grid boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_rulers boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_rug_width numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_rug_height numeric NOT NULL DEFAULT 5;
