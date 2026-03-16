CREATE POLICY "Owners can update assigned requests status"
ON public.transport_requests
FOR UPDATE
TO authenticated
USING (assigned_owner_id = auth.uid())
WITH CHECK (assigned_owner_id = auth.uid());