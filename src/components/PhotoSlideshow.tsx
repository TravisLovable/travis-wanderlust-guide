
import React, { useState } from 'react';
import { usePexelsVideo } from '@/hooks/usePexelsVideo';

interface PhotoSlideshowProps {
  destination?: string;
}

const PhotoSlideshow = ({ destination }: PhotoSlideshowProps) => {
  const [videoError, setVideoError] = useState(false);
  const { videoUrl, isLoading, error } = usePexelsVideo(destination || '');

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video failed to load, showing fallback image');
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setVideoError(false);
  };

  // Fallback video URL (original Big Buck Bunny)
  const fallbackVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  // Use Pexels video if available, otherwise use fallback
  const currentVideoUrl = videoUrl || fallbackVideoUrl;

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {!videoError ? (
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
            <p className="text-white/70 text-sm mt-1">Using fallback video</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoSlideshow;
