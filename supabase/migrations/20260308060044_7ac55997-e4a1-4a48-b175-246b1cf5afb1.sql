
-- Allow authenticated users to upload to fleet-images bucket
CREATE POLICY "Authenticated users can upload fleet images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fleet-images');

-- Allow public read access to fleet images
CREATE POLICY "Public can view fleet images"
ON storage.objects FOR SELECT
USING (bucket_id = 'fleet-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own fleet images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fleet-images' AND (storage.foldername(name))[1] = auth.uid()::text);
