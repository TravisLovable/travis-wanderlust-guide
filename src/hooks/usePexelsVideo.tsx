
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
        // Extract country/city name for better search results
        const searchTerm = destination.includes(',') 
          ? destination.split(',')[0].trim() 
          : destination;

        // Add travel-related keywords for better scenic results
        const query = `${searchTerm} travel scenic landscape nature`;
        
        console.log('Searching Pexels for videos:', query);

        const response = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`,
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
        console.log('Pexels API response:', data);

        if (data.videos && data.videos.length > 0) {
          // Find the best quality HD video
          const video = data.videos[0];
          const hdVideo = video.video_files.find(file => 
            file.quality === 'hd' && file.file_type === 'video/mp4'
          ) || video.video_files.find(file => 
            file.file_type === 'video/mp4'
          );

          if (hdVideo) {
            console.log('Selected video URL:', hdVideo.link);
            setVideoUrl(hdVideo.link);
          } else {
            throw new Error('No suitable video format found');
          }
        } else {
          console.log('No videos found for destination, using fallback');
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
