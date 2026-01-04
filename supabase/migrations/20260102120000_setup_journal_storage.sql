-- Create Public Bucket for Public Journal Media
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal_public', 'journal_public', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to their own folder in Public Bucket
CREATE POLICY "Auth Insert Public Journal"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal_public' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create Private Bucket for Private Journal Media
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal_private', 'journal_private', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to their own folder in Private Bucket
CREATE POLICY "Auth Insert Private Journal"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal_private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can view their own files in Private Bucket
CREATE POLICY "Auth Select Private Journal"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal_private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);