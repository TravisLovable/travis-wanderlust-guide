import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getSearchableDestination, normalizeDestination } from '@/utils/destinationHelpers';
import type { Destination } from '@/types/destination';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface PhotoSlideshowProps {
  placeDetails: SelectedPlace | null;
}

interface UnsplashPhoto {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  description: string;
}

const PhotoSlideshow = ({ placeDetails }: PhotoSlideshowProps) => {
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const processDestination = (placeDetails: SelectedPlace | null): string => {
    if (!placeDetails) return '';
    return placeDetails.name || placeDetails.formatted_address || '';
  }

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!placeDetails) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const processedDestination = processDestination(placeDetails);

        const { data, error: functionError } = await supabase.functions.invoke('unsplash-photos', {
          body: {
            query: processedDestination,
            perPage: 8
          }
        });

        if (functionError) {
          console.error('Unsplash function error:', functionError);
          throw functionError;
        }

        if (data?.results && Array.isArray(data.results)) {
          setPhotos(data.results);
        } else {
          throw new Error('Invalid response format');
        }

      } catch (error) {
        console.error('Error fetching photos:', error);
        setError(error instanceof Error ? error.message : 'Failed to load photos');

        // Set fallback photos
        setPhotos([
          {
            id: 'fallback-1',
            urls: {
              small: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              regular: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
            },
            alt_description: `Beautiful view of ${placeDetails?.formatted_address || placeDetails?.name || 'this destination'}`,
            user: { name: 'Unsplash', username: 'unsplash' },
            description: `Discover the beauty of ${placeDetails?.formatted_address || placeDetails?.name || 'this amazing destination'}`
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [placeDetails]);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setIsLiked(false); // Reset like state for new photo
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setIsLiked(false); // Reset like state for new photo
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center animate-slide-in-up">
        <div className="text-center text-white">
          <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse-slow playful-hover" />
          <p className="text-sm animate-fade-in-out">Loading beautiful photos...</p>
          <div className="flex justify-center mt-2 space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce-gentle"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Camera className="w-8 h-8 mx-auto mb-2" />
          <p className="text-lg font-light">
            {placeDetails ? `Discover the beauty of ${placeDetails.formatted_address || placeDetails.name}` : 'Discover beautiful destinations around the world'}
          </p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden group animate-slide-in-up">
      {/* Main Photo */}
      <div className="relative w-full h-full">
        <img
          src={currentPhoto.urls.regular}
          alt={currentPhoto.alt_description}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback to small image if regular fails
            const target = e.target as HTMLImageElement;
            if (target.src !== currentPhoto.urls.small) {
              target.src = currentPhoto.urls.small;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Floating hearts effect */}
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <Heart
                key={i}
                className="absolute w-6 h-6 text-pink-400 animate-bounce-gentle fill-current"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}

        {/* Navigation Controls */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 playful-button"
              onMouseEnter={(e) => e.currentTarget.classList.add('animate-scale-bounce')}
              onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-scale-bounce')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 playful-button"
              onMouseEnter={(e) => e.currentTarget.classList.add('animate-scale-bounce')}
              onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-scale-bounce')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Photo Indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 playful-button ${index === currentIndex
                  ? 'bg-white animate-scale-bounce'
                  : 'bg-white/40 hover:bg-white/60 hover:scale-125'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Like button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 playful-button"
          onMouseEnter={(e) => e.currentTarget.classList.add('animate-wiggle')}
          onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-wiggle')}
        >
          <Heart className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-pink-400 text-pink-400 scale-110' : ''}`} />
        </Button>

        {/* Content Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-light text-lg tracking-wide drop-shadow-lg mb-1">
            {currentPhoto.description || (placeDetails ? `Discover the beauty of ${placeDetails.formatted_address || placeDetails.name}` : 'Discover beautiful destinations around the world')}
          </p>
          <p className="text-white/80 text-xs">
            Photo by {currentPhoto.user.name} on Unsplash
          </p>
        </div>

        {/* Photo Counter */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoSlideshow;
