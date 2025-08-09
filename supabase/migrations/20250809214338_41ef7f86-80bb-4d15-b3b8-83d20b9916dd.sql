-- Create users table for user profiles
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  preferred_airline TEXT,
  frequent_flyer_number TEXT,
  travel_type TEXT,
  nationality TEXT,
  country TEXT,
  profile_photo_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_id);

CREATE POLICY "Users can create their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_id);

CREATE POLICY "Users can delete their own profile" 
ON public.users 
FOR DELETE 
USING (auth.uid() = auth_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();