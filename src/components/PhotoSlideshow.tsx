
import React, { useState } from 'react';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';

interface PhotoSlideshowProps {
  destination?: string;
}

const PhotoSlideshow = ({ destination }: PhotoSlideshowProps) => {
  const [videoError, setVideoError] = useState(false);
  const { videoUrl, isLoading, error } = usePexelsVideo(destination || '');

  console.log('📺 PhotoSlideshow - videoUrl:', videoUrl);
  console.log('📺 PhotoSlideshow - isLoading:', isLoading);
  console.log('📺 PhotoSlideshow - error:', error);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('❌ Video failed to load:', e);
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded successfully');
    setVideoError(false);
  };

  // Fallback video URL (only used when video fails to load)
  const fallbackVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  // Use Pexels video if available and no error, otherwise use fallback only if there was a loading error
  const currentVideoUrl = videoUrl && !videoError ? videoUrl : (videoError ? fallbackVideoUrl : null);

  console.log('🎯 PhotoSlideshow - currentVideoUrl:', currentVideoUrl);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {currentVideoUrl && !videoError ? (
          <video
            src={currentVideoUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            onError={handleVideoError}
            onLoadedData={handleVideoLoad}
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-light text-lg tracking-wide drop-shadow-lg">
            {destination ? `Discover the beauty of ${destination}` : 'Discover beautiful destinations around the world'}
          </p>
          {isLoading && (
            <p className="text-white/70 text-sm mt-1">Loading destination video...</p>
          )}
          {error && (
            <p className="text-white/70 text-sm mt-1">Video loading failed: {error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoSlideshow;
