-- Add credits column to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 1000 NOT NULL;

-- Create public.voices table
CREATE TABLE IF NOT EXISTS public.voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  sample_url TEXT,
  voice_url TEXT,
  status TEXT NOT NULL DEFAULT 'cloning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on public.voices
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;

-- Define Policies for public.voices
CREATE POLICY "Allow individual select on voices" ON public.voices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert on voices" ON public.voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual delete on voices" ON public.voices
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow individual update on voices" ON public.voices
  FOR UPDATE USING (auth.uid() = user_id);

-- Create public.tts_recordings table
CREATE TABLE IF NOT EXISTS public.tts_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  voice_type TEXT NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT,
  audio_key TEXT,
  status TEXT NOT NULL DEFAULT 'generating',
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on public.tts_recordings
ALTER TABLE public.tts_recordings ENABLE ROW LEVEL SECURITY;

-- Define Policies for public.tts_recordings
CREATE POLICY "Allow individual select on tts" ON public.tts_recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insert on tts" ON public.tts_recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual delete on tts" ON public.tts_recordings
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow individual update on tts" ON public.tts_recordings
  FOR UPDATE USING (auth.uid() = user_id);
