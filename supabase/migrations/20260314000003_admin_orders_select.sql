-- Allow admins to read ALL orders (was missing, caused admin panel to show no orders)
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());
