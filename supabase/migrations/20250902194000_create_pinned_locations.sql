-- Create pinned_locations table for user's saved destinations (idempotent: may already exist from 20250115000000)
CREATE TABLE IF NOT EXISTS public.pinned_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  formatted_address TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  country_code TEXT,
  region TEXT,
  place_id TEXT,
  pinned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pinned_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for pinned locations access (drop first so rerun is safe)
DROP POLICY IF EXISTS "Users can view their own pinned locations" ON public.pinned_locations;
CREATE POLICY "Users can view their own pinned locations"
ON public.pinned_locations
FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create their own pinned locations" ON public.pinned_locations;
CREATE POLICY "Users can create their own pinned locations"
ON public.pinned_locations
FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own pinned locations" ON public.pinned_locations;
CREATE POLICY "Users can update their own pinned locations"
ON public.pinned_locations
FOR UPDATE
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own pinned locations" ON public.pinned_locations;
CREATE POLICY "Users can delete their own pinned locations"
ON public.pinned_locations
FOR DELETE
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_pinned_locations_updated_at ON public.pinned_locations;
CREATE TRIGGER update_pinned_locations_updated_at
BEFORE UPDATE ON public.pinned_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pinned_locations_user_id ON public.pinned_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_pinned_locations_pinned_at ON public.pinned_locations(pinned_at DESC);

-- Add unique constraint to prevent duplicate pins for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_pinned_locations_user_place
ON public.pinned_locations(user_id, place_id)
WHERE place_id IS NOT NULL;

-- For locations without place_id, use formatted_address as fallback uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_pinned_locations_user_address
ON public.pinned_locations(user_id, formatted_address)
WHERE place_id IS NULL;
