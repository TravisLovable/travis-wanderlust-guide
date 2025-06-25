
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
        
        // Try multiple search strategies
        const searchQueries = [
          `${countryName} drone aerial landscape`,
          `${countryName} travel beautiful scenic`,
          `${countryName} nature landscape`,
          `${countryName}` // Just the country name as fallback
        ];
        
        let selectedVideo = null;

        for (const query of searchQueries) {
          console.log(`Trying Pexels search: "${query}"`);
          
          const response = await fetch(
            `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
            {
              headers: {
                'Authorization': PEXELS_API_KEY,
              },
            }
          );

          if (!response.ok) {
            console.error(`Pexels API error for query "${query}":`, response.status);
            continue;
          }

          const data: PexelsResponse = await response.json();
          console.log(`Pexels results for "${query}":`, data.total_results, 'videos found');

          if (data.videos && data.videos.length > 0) {
            const video = data.videos[0];
            const hdVideo = video.video_files.find(file => 
              file.quality === 'hd' && file.file_type === 'video/mp4'
            ) || video.video_files.find(file => 
              file.file_type === 'video/mp4'
            );

            if (hdVideo) {
              console.log(`SUCCESS: Found video for "${query}":`, hdVideo.link);
              selectedVideo = hdVideo.link;
              break; // Stop searching once we find a video
            }
          }
        }

        if (selectedVideo) {
          setVideoUrl(selectedVideo);
        } else {
          console.log('No videos found for any search term, using fallback');
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
