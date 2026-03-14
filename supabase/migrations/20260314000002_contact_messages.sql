-- ── contact_messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a message
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Only admins can read, update (mark as read), or delete messages
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (public.is_admin());
