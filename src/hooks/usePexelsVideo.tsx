
import { useState, useEffect } from 'react';

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

const PEXELS_API_KEY = '1acrtV7OPRQmWjmxtM9njqOuQCe47mkyZELwrSyYbhT7BkWuIbgtL2ld';

// Extract country name from formatted address
const extractCountryName = (destination: string): string => {
  if (!destination) return '';
  
  // Split by comma and take the last part (usually the country)
  const parts = destination.split(',').map(part => part.trim());
  const countryName = parts[parts.length - 1];
  
  console.log('Extracted country from destination:', { destination, countryName });
  return countryName;
};

export const usePexelsVideo = (destination: string) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!destination) return;

      setIsLoading(true);
      setError(null);

      try {
        // Extract country name for better search results
        const countryName = extractCountryName(destination);
        
        // Prioritize drone footage with country-specific search
        const query = `${countryName} drone aerial scenic landscape`;
        
        console.log('Searching Pexels for drone videos:', query);

        const response = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
          {
            headers: {
              'Authorization': PEXELS_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Pexels API error: ${response.status}`);
        }

        const data: PexelsResponse = await response.json();
        console.log('Pexels API response for drone search:', data);

        if (data.videos && data.videos.length > 0) {
          // Find the best quality HD video
          const video = data.videos[0];
          const hdVideo = video.video_files.find(file => 
            file.quality === 'hd' && file.file_type === 'video/mp4'
          ) || video.video_files.find(file => 
            file.file_type === 'video/mp4'
          );

          if (hdVideo) {
            console.log('Selected drone video URL:', hdVideo.link);
            setVideoUrl(hdVideo.link);
          } else {
            throw new Error('No suitable video format found');
          }
        } else {
          console.log('No drone videos found, trying fallback search');
          
          // Fallback: try broader search without "drone"
          const fallbackQuery = `${countryName} travel scenic nature`;
          console.log('Fallback search:', fallbackQuery);
          
          const fallbackResponse = await fetch(
            `https://api.pexels.com/videos/search?query=${encodeURIComponent(fallbackQuery)}&per_page=10&orientation=landscape`,
            {
              headers: {
                'Authorization': PEXELS_API_KEY,
              },
            }
          );

          if (fallbackResponse.ok) {
            const fallbackData: PexelsResponse = await fallbackResponse.json();
            console.log('Fallback search results:', fallbackData);
            
            if (fallbackData.videos && fallbackData.videos.length > 0) {
              const video = fallbackData.videos[0];
              const hdVideo = video.video_files.find(file => 
                file.quality === 'hd' && file.file_type === 'video/mp4'
              ) || video.video_files.find(file => 
                file.file_type === 'video/mp4'
              );

              if (hdVideo) {
                console.log('Selected fallback video URL:', hdVideo.link);
                setVideoUrl(hdVideo.link);
                return;
              }
            }
          }
          
          console.log('No videos found for destination, using default');
          setVideoUrl(null);
        }
      } catch (err) {
        console.error('Error fetching Pexels video:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch video');
        setVideoUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [destination]);

  return { videoUrl, isLoading, error };
};
