
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
    console.log('🎬 Destination type:', typeof destination);
    console.log('🎬 Destination length:', destination?.length);
    
    // Get the Pexels API key from Supabase secrets
    const PEXELS_API_KEY = Deno.env.get('PHOTO_SLIDE-DECK');
    
    console.log('🔑 Checking Pexels API key availability:', PEXELS_API_KEY ? 'Found' : 'Missing');
    
    if (!PEXELS_API_KEY) {
      console.error('❌ PHOTO_SLIDE-DECK secret not configured in Supabase');
      return new Response(
        JSON.stringify({ 
          error: 'Pexels API key not configured',
          details: 'PHOTO_SLIDE-DECK secret is missing from Supabase environment'
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!destination) {
      console.log('❌ No destination provided');
      return new Response(
        JSON.stringify({ 
          error: 'No destination provided',
          details: 'Destination parameter is required for video search'
        }), 
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
      
      console.log('🌍 Extracted country from destination:', { 
        originalDestination: destination, 
        splitParts: parts, 
        extractedCountry: countryName 
      });
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
    let successfulQuery = null;

    for (const query of searchQueries) {
      console.log(`🔍 Starting Pexels search attempt: "${query}"`);
      
      try {
        const pexelsUrl = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`;
        console.log('📡 Making request to Pexels API:', pexelsUrl);
        
        const response = await fetch(pexelsUrl, {
          headers: {
            'Authorization': PEXELS_API_KEY,
          },
        });

        console.log(`📡 Pexels API response status for "${query}":`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Pexels API error for "${query}":`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          continue;
        }

        const data: PexelsResponse = await response.json();
        console.log(`📊 Results for "${query}": ${data.total_results} videos found`);
        
        if (data.videos && data.videos.length > 0) {
          console.log(`✅ Found ${data.videos.length} videos for query: "${query}"`);
          console.log(`📋 First few videos for "${query}":`, 
            data.videos.slice(0, 3).map(v => ({ 
              id: v.id, 
              duration: v.duration, 
              fileCount: v.video_files?.length 
            }))
          );

          const video = data.videos[0];
          console.log(`🎥 Examining video ${video.id}:`, { 
            id: video.id, 
            files: video.video_files?.length,
            fileTypes: video.video_files?.map(f => ({ quality: f.quality, type: f.file_type }))
          });
          
          const hdVideo = video.video_files.find(file => 
            file.quality === 'hd' && file.file_type === 'video/mp4'
          ) || video.video_files.find(file => 
            file.file_type === 'video/mp4'
          );

          if (hdVideo) {
            console.log(`✅ SUCCESS: Found suitable video for "${query}":`, {
              videoId: video.id,
              quality: hdVideo.quality,
              url: hdVideo.link
            });
            selectedVideo = hdVideo.link;
            successfulQuery = query;
            break; // Stop searching once we find a video
          } else {
            console.log(`⚠️ No suitable video file found for "${query}" - available files:`, 
              video.video_files?.map(f => ({ quality: f.quality, type: f.file_type }))
            );
          }
        } else {
          console.log(`📭 No videos returned for "${query}"`);
        }
      } catch (queryError) {
        console.error(`🚨 Error during query "${query}":`, {
          error: queryError.message,
          stack: queryError.stack
        });
      }
    }

    console.log('🎯 Final result summary:', {
      selectedVideo: selectedVideo,
      successfulQuery: successfulQuery,
      totalQueriesAttempted: searchQueries.length
    });
    
    return new Response(
      JSON.stringify({ 
        videoUrl: selectedVideo,
        query: successfulQuery,
        destination: destination,
        extractedCountry: extractCountryName(destination)
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('🚨 Critical error in pexels-video-search function:', {
      message: error.message,
      stack: error.stack
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
