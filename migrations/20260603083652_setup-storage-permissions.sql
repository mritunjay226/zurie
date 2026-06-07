-- Grant usage on storage schema to authenticated and anon
GRANT USAGE ON SCHEMA storage TO authenticated, anon;

-- Grant select on storage.buckets to authenticated and anon
GRANT SELECT ON storage.buckets TO authenticated, anon;

-- Grant all privileges on storage.objects to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Grant select on storage.objects to anon
GRANT SELECT ON storage.objects TO anon;
