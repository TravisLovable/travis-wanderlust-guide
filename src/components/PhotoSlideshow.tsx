
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Photo {
  url: string;
  caption: string;
}

interface PhotoSlideshowProps {
  destination?: string;
}

const PhotoSlideshow = ({ destination = "travel" }: PhotoSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fallback photos for when API fails or no destination is provided
  const fallbackPhotos: Photo[] = [
    {
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      caption: 'Discover beautiful destinations around the world'
    },
    {
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
      caption: 'Explore stunning landscapes and hidden gems'
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      caption: 'Experience unforgettable travel adventures'
    }
  ];

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!destination) {
        setPhotos(fallbackPhotos);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(destination)}&per_page=6&orientation=landscape`, {
          headers: {
            Authorization: 'TRAVIS_PHOTO_DECK'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }

        const data = await response.json();
        
        if (data.photos && data.photos.length > 0) {
          const formattedPhotos: Photo[] = data.photos.map((photo: any) => ({
            url: photo.src.large2x || photo.src.large || photo.src.medium,
            caption: photo.alt || `Beautiful view of ${destination}`
          }));
          setPhotos(formattedPhotos);
        } else {
          // No photos found for destination, use fallback
          setPhotos(fallbackPhotos);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
        // Use fallback photos on error
        setPhotos(fallbackPhotos);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [destination]);

  useEffect(() => {
    if (photos.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading destination photos...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden group">
      {/* Photo Container */}
      <div className="relative w-full h-full">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to a default image if the photo fails to load
                e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-light text-lg tracking-wide drop-shadow-lg">
                {photo.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white border-none opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white border-none opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoSlideshow;
