
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  video_files: Array<{
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }>;
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

interface PexelsResponse {
  videos: PexelsVideo[];
  total_results: number;
  page: number;
  per_page: number;
  prev_page?: string;
  next_page?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination } = await req.json();
    
    console.log('🎬 Pexels edge function called with destination:', destination);
    
    const PEXELS_API_KEY = Deno.env.get('PHOTO_SLIDE-DECK');
    
    if (!PEXELS_API_KEY) {
      console.error('❌ PHOTO_SLIDE-DECK secret not configured');
      return new Response(
        JSON.stringify({ error: 'Pexels API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!destination) {
      console.log('❌ No destination provided');
      return new Response(
        JSON.stringify({ error: 'No destination provided' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract country name from formatted address
    const extractCountryName = (destination: string): string => {
      if (!destination) return '';
      
      // Split by comma and take the last part (usually the country)
      const parts = destination.split(',').map(part => part.trim());
      const countryName = parts[parts.length - 1];
      
      console.log('🌍 Extracted country from destination:', { destination, countryName });
      return countryName;
    };

    const countryName = extractCountryName(destination);
    console.log('🔍 Will search for videos using country:', countryName);
    
    // Define search queries with specific hierarchy
    const searchQueries = [
      `Drone ${countryName}`,
      `Travel ${countryName}`,
      `Scenic ${countryName}`,
      `Nature ${countryName}`,
      `Drone travel` // Global fallback
    ];
    
    console.log('📋 Search queries prepared:', searchQueries);
    
    let selectedVideo = null;

    for (const query of searchQueries) {
      console.log(`🔍 Pexels search attempt: "${query}"`);
      
      try {
        const response = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
          {
            headers: {
              'Authorization': PEXELS_API_KEY,
            },
          }
        );

        console.log(`📡 Pexels API response status for "${query}":`, response.status);

        if (!response.ok) {
          console.error(`❌ Pexels API error for "${query}":`, response.status, response.statusText);
          continue;
        }

        const data: PexelsResponse = await response.json();
        console.log(`📊 Results for "${query}": ${data.total_results} videos found`);
        console.log(`📋 First few videos:`, data.videos?.slice(0, 3)?.map(v => ({ id: v.id, duration: v.duration })));

        if (data.videos && data.videos.length > 0) {
          const video = data.videos[0];
          console.log(`🎥 Examining video:`, { id: video.id, files: video.video_files?.length });
          
          const hdVideo = video.video_files.find(file => 
            file.quality === 'hd' && file.file_type === 'video/mp4'
          ) || video.video_files.find(file => 
            file.file_type === 'video/mp4'
          );

          if (hdVideo) {
            console.log(`✅ SUCCESS: Found video for "${query}":`, hdVideo.link);
            selectedVideo = hdVideo.link;
            break; // Stop searching once we find a video
          } else {
            console.log(`⚠️ No suitable video file found for "${query}"`);
          }
        }
      } catch (queryError) {
        console.error(`🚨 Error during query "${query}":`, queryError);
      }
    }

    console.log('🎯 Returning video URL:', selectedVideo);
    
    return new Response(
      JSON.stringify({ videoUrl: selectedVideo }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('🚨 Error in pexels-video-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
