-- Allow anyone (including anonymous/unauthenticated users) to read any design by its ID.
-- This enables shared design links to work for recipients who don't own the design.
DROP POLICY IF EXISTS "Anyone can view designs by ID" ON public.designs;
CREATE POLICY "Anyone can view designs by ID"
ON public.designs FOR SELECT
USING (true);
