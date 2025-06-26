
-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow users to upload their own profile photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can upload their own profile photos'
    ) THEN
        CREATE POLICY "Users can upload their own profile photos" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Create policy to allow users to view their own profile photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Users can view their own profile photos'
    ) THEN
        CREATE POLICY "Users can view their own profile photos" ON storage.objects
        FOR SELECT USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Create policy to allow public access to profile photos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Profile photos are publicly accessible'
    ) THEN
        CREATE POLICY "Profile photos are publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'profile-photos');
    END IF;
END $$;

-- Update the existing users table to add the profile_photo_url column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Update the existing users table to add email column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- Enable RLS if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
