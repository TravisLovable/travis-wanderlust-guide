
import React from 'react';

interface PhotoSlideshowProps {
  destination?: string;
}

const PhotoSlideshow = ({ destination }: PhotoSlideshowProps) => {
  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden">
      {/* Video Container */}
      <div className="relative w-full h-full">
        <video
          src="/lovable-uploads/522158cc-d3f5-459c-9d11-8cdd6e223c43.png"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
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
