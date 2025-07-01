-- Create a storage bucket for store assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true);

-- Set up storage policies to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-assets' AND
  (auth.uid() = owner)
);

-- Allow public access to view files
CREATE POLICY "Public users can view files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'store-assets');

-- Allow users to update and delete their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner);
