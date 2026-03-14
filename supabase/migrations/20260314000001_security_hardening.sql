-- ============================================================
-- SECURITY HARDENING
-- ============================================================
-- Admin check helper: returns true when the calling JWT carries
-- app_metadata.role = 'admin'  (set this in Supabase Dashboard
-- Authentication > Users > Edit user > app_metadata: {"role":"admin"})
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── orders ───────────────────────────────────────────────────
-- Drop the overly permissive "any authenticated user can update any order"
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;

-- Users may only update their OWN orders (e.g. cancel)
CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins may update ANY order (status, admin_note, tracking_number, etc.)
CREATE POLICY "Admins can update any order"
  ON public.orders FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── rug_textures ─────────────────────────────────────────────
-- Drop the open "any authenticated user" write policies
DROP POLICY IF EXISTS "Authenticated users can insert rug textures"   ON public.rug_textures;
DROP POLICY IF EXISTS "Authenticated users can update rug textures"   ON public.rug_textures;
DROP POLICY IF EXISTS "Authenticated users can delete rug textures"   ON public.rug_textures;

-- Only admins may mutate texture records
CREATE POLICY "Admins can insert rug textures"
  ON public.rug_textures FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update rug textures"
  ON public.rug_textures FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete rug textures"
  ON public.rug_textures FOR DELETE
  TO authenticated
  USING  (public.is_admin());

-- ── storage objects (rug-textures bucket) ───────────────────
-- Drop open storage policies and replace with admin-only
DROP POLICY IF EXISTS "Authenticated users can upload rug textures"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update rug textures"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete rug textures"  ON storage.objects;

CREATE POLICY "Admins can upload rug textures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'rug-textures' AND public.is_admin());

CREATE POLICY "Admins can update rug texture objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING  (bucket_id = 'rug-textures' AND public.is_admin())
  WITH CHECK (bucket_id = 'rug-textures' AND public.is_admin());

CREATE POLICY "Admins can delete rug texture objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING  (bucket_id = 'rug-textures' AND public.is_admin());
