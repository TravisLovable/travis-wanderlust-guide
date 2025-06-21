
import React from 'react';

interface PhotoSlideshowProps {
  destination?: string;
}

const PhotoSlideshow = ({ destination }: PhotoSlideshowProps) => {
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video failed to load:', e);
    console.error('Video error details:', (e.target as HTMLVideoElement).error);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  const handleVideoCanPlay = () => {
    console.log('Video can start playing');
  };

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden">
      {/* Video Container */}
      <div className="relative w-full h-full">
        <video
          src="https://videos.pexels.com/video-files/8357290/8357290-hd_1920_1080_30fps.mp4"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoCanPlay}
          onLoadStart={() => console.log('Video load started')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-light text-lg tracking-wide drop-shadow-lg">
            {destination ? `Discover the beauty of ${destination}` : 'Discover beautiful destinations around the world'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoSlideshow;
