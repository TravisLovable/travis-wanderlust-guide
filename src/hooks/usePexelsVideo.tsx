
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePexelsVideo = (destination: string) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎬 usePexelsVideo hook called with destination:', destination);
    
    const fetchVideo = async () => {
      if (!destination) {
        console.log('❌ No destination provided, skipping video fetch');
        return;
      }

      console.log('🚀 Starting Pexels video fetch via edge function for:', destination);
      setIsLoading(true);
      setError(null);

      try {
        console.log('📡 Calling pexels-video-search edge function...');
        
        const { data, error: functionError } = await supabase.functions.invoke('pexels-video-search', {
          body: { destination }
        });

        if (functionError) {
          console.error('🚨 Edge function error:', functionError);
          setError(functionError.message || 'Failed to fetch video');
          setVideoUrl(null);
          return;
        }

        console.log('📊 Edge function response:', data);

        if (data?.videoUrl) {
          console.log('✅ SUCCESS: Received video URL from edge function:', data.videoUrl);
          setVideoUrl(data.videoUrl);
        } else {
          console.log('❌ No video URL returned from edge function');
          setVideoUrl(null);
        }

      } catch (err) {
        console.error('🚨 Error calling pexels-video-search edge function:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch video');
        setVideoUrl(null);
      } finally {
        console.log('✅ Pexels video fetch completed');
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [destination]);

  return { videoUrl, isLoading, error };
};
