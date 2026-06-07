-- Create avatars table in public schema
CREATE TABLE public.avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style TEXT NOT NULL,
  prompt TEXT,
  image_url_16_9 TEXT NOT NULL,
  image_url_9_16 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- Define Policies for public.avatars
CREATE POLICY "Allow individual select" ON public.avatars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert" ON public.avatars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual delete" ON public.avatars
  FOR DELETE USING (auth.uid() = user_id);
