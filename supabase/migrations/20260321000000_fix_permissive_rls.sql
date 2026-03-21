-- ============================================================
-- SECURITY: Fix overly permissive RLS policies
-- ============================================================

-- ── designer_settings ────────────────────────────────────────
-- Previously any authenticated user could INSERT or UPDATE settings.
-- Restrict to admin-only (admin JWT carries app_metadata.role = 'admin').

DROP POLICY IF EXISTS "Authenticated users can insert designer settings" ON public.designer_settings;
DROP POLICY IF EXISTS "Authenticated users can update designer settings" ON public.designer_settings;

CREATE POLICY "Admins can insert designer settings"
  ON public.designer_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update designer settings"
  ON public.designer_settings FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── contact_messages ─────────────────────────────────────────
-- Previously WITH CHECK (true) allowed completely unrestricted inserts.
-- Replace with field-level validation: enforce non-empty required fields
-- and reasonable length limits to prevent abuse.

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(trim(name))    BETWEEN 1 AND 255  AND
    position('@' IN email) > 1             AND
    length(trim(email))   BETWEEN 3 AND 255  AND
    length(trim(message)) BETWEEN 1 AND 5000
  );

-- ── NOTE: Leaked password protection (HIBP) ──────────────────
-- This cannot be enabled via a SQL migration.
-- Enable it in the Supabase Dashboard:
--   Authentication > Security > "Prevent use of compromised passwords"
-- ─────────────────────────────────────────────────────────────
