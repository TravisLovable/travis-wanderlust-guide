
import React, { useState } from 'react';

interface PhotoSlideshowProps {
  destination?: string;
}

const PhotoSlideshow = ({ destination }: PhotoSlideshowProps) => {
  const [videoError, setVideoError] = useState(false);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video failed to load, showing fallback image');
    setVideoError(true);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {!videoError ? (
          <video
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
        {/* Blurred gradient overlay from bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[1px]" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-light text-lg tracking-wide" 
             style={{
               textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 1)'
             }}>
            {destination ? `Discover the beauty of ${destination}` : 'Discover beautiful destinations around the world'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoSlideshow;
