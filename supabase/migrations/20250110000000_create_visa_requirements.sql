-- Create visa requirements table for storing structured visa data
CREATE TABLE public.visa_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_aliases TEXT[], -- Array of alternative names/cities
  visa_required BOOLEAN,
  visa_type TEXT, -- e.g., "tourist", "business", "transit"
  max_stay_days INTEGER,
  max_stay_description TEXT, -- e.g., "90 days within 180-day period"
  passport_validity_months INTEGER,
  passport_validity_description TEXT,
  yellow_fever_required BOOLEAN DEFAULT false,
  yellow_fever_notes TEXT,
  processing_time_days INTEGER,
  processing_time_description TEXT,
  cost_usd DECIMAL(10,2),
  cost_description TEXT,
  requires_eta BOOLEAN DEFAULT false,
  eta_description TEXT,
  exceptions TEXT,
  additional_notes TEXT,
  data_source TEXT NOT NULL, -- Source of the information
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_visa_requirements_origin_destination 
ON public.visa_requirements(origin_country, destination_country);

CREATE INDEX idx_visa_requirements_destination_aliases 
ON public.visa_requirements USING GIN(destination_aliases);

-- Enable Row Level Security (though this data is public)
ALTER TABLE public.visa_requirements ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can read visa requirements" 
ON public.visa_requirements 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert/update (for admin purposes)
CREATE POLICY "Authenticated users can manage visa requirements" 
ON public.visa_requirements 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE TRIGGER update_visa_requirements_updated_at
BEFORE UPDATE ON public.visa_requirements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial data for testing
INSERT INTO public.visa_requirements (
  origin_country, destination_country, destination_aliases, visa_required, 
  max_stay_days, max_stay_description, passport_validity_months, passport_validity_description,
  yellow_fever_required, data_source
) VALUES 
-- US to popular destinations
('US', 'France', ARRAY['france', 'paris', 'lyon', 'marseille'], false, 90, '90 days within 180-day period (Schengen)', 3, '3 months beyond intended stay', false, 'Schengen Agreement'),
('US', 'Japan', ARRAY['japan', 'tokyo', 'osaka', 'kyoto'], false, 90, '90 days for tourism', 0, 'Valid for entire stay', false, 'Japan Immigration'),
('US', 'United Kingdom', ARRAY['uk', 'united kingdom', 'london', 'manchester', 'edinburgh'], false, 180, '6 months for tourism', 0, 'Valid for entire stay', false, 'UK Border Force'),
('US', 'Brazil', ARRAY['brazil', 'são paulo', 'sao paulo', 'rio de janeiro', 'brasília'], false, 90, '90 days for tourism', 6, '6 months minimum validity', false, 'Brazilian Immigration'),
('US', 'Peru', ARRAY['peru', 'lima', 'cusco', 'arequipa'], false, 183, '183 days for tourism', 6, '6 months minimum validity', true, 'Peruvian Immigration'),
('US', 'Australia', ARRAY['australia', 'sydney', 'melbourne', 'brisbane'], false, 90, '90 days with ETA', 0, 'Valid for entire stay', false, 'Australian Border Force'),
('US', 'China', ARRAY['china', 'beijing', 'shanghai', 'guangzhou'], true, NULL, 'Visa required', 6, '6 months minimum validity', false, 'Chinese Embassy'),
('US', 'India', ARRAY['india', 'mumbai', 'delhi', 'bangalore'], true, NULL, 'E-visa available', 6, '6 months minimum validity', true, 'Indian Immigration');