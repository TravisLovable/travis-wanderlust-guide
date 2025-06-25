
-- Create a users table to store onboarding data
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT,
  preferred_airline TEXT,
  frequent_flyer_number TEXT,
  travel_type TEXT CHECK (travel_type IN ('Luxury', 'Budget', 'Adventure')),
  nationality TEXT,
  country TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own data
CREATE POLICY "Users can view their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert their own data" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = auth_id);

-- Create a function to automatically create a user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (auth_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
