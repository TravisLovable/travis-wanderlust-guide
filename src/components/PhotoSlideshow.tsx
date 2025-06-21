
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

const PhotoSlideshow = ({ destination }: PhotoSlideshowProps) => {
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

  // Get contextual search terms based on destination
  const getSearchQueries = (dest: string) => {
    // Create multiple search queries for better results
    return [
      `${dest} landmarks`,
      `${dest} tourism attractions`,
      `${dest} city skyline`,
      `${dest} travel photography`
    ];
  };

  // Filter out irrelevant photos based on alt text and context
  const isPhotoRelevant = (photo: any, destination: string) => {
    const alt = photo.alt?.toLowerCase() || '';
    const dest = destination.toLowerCase();
    
    // List of tropical/warm climate countries that shouldn't show snow
    const tropicalCountries = ['brazil', 'thailand', 'ghana', 'india', 'indonesia', 'philippines', 
                              'vietnam', 'malaysia', 'singapore', 'mexico', 'colombia', 'venezuela',
                              'ecuador', 'peru', 'bolivia', 'paraguay', 'uruguay', 'argentina',
                              'nigeria', 'kenya', 'tanzania', 'uganda', 'rwanda', 'cameroon'];
    
    const isTropicalCountry = tropicalCountries.some(country => dest.includes(country));
    
    // Filter out snow/winter images for tropical countries
    if (isTropicalCountry && (alt.includes('snow') || alt.includes('winter') || alt.includes('skiing') || alt.includes('ice'))) {
      return false;
    }
    
    // Filter out completely unrelated content
    const irrelevantTerms = ['wedding', 'portrait', 'studio', 'product', 'food close-up', 'abstract'];
    if (irrelevantTerms.some(term => alt.includes(term))) {
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      // Reset to loading state whenever destination changes
      setIsLoading(true);
      setCurrentSlide(0); // Reset slide position
      
      // If no destination provided, use fallback photos
      if (!destination || destination.trim() === '') {
        console.log('No destination provided, using fallback photos');
        setPhotos(fallbackPhotos);
        setIsLoading(false);
        return;
      }

      try {
        console.log('=== FETCHING PHOTOS FOR DESTINATION:', destination, '===');
        const searchQueries = getSearchQueries(destination);
        let allPhotos: any[] = [];
        
        // Try multiple search queries to get diverse, relevant results
        for (const query of searchQueries) {
          try {
            console.log('🔍 API Search Query:', query);
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=4&orientation=landscape`, {
              headers: {
                Authorization: '1acrtV7OPRQmWjmxtM9njqOuQCe47mkyZELwrSyYbhT7BkWuIbgtL2ld'
              }
            });

            if (response.ok) {
              const data = await response.json();
              console.log(`📸 Found ${data.photos?.length || 0} photos for query: ${query}`);
              if (data.photos && data.photos.length > 0) {
                // Filter relevant photos and add to collection
                const relevantPhotos = data.photos.filter((photo: any) => isPhotoRelevant(photo, destination));
                console.log(`✅ ${relevantPhotos.length} relevant photos after filtering`);
                allPhotos = [...allPhotos, ...relevantPhotos];
              }
            } else {
              console.log(`❌ API request failed for query: ${query}`, response.status);
            }
          } catch (error) {
            console.log(`❌ Search failed for query: ${query}`, error);
            continue;
          }
        }
        
        if (allPhotos.length > 0) {
          // Remove duplicates and take the best 6 photos
          const uniquePhotos = allPhotos.filter((photo, index, self) => 
            index === self.findIndex(p => p.id === photo.id)
          ).slice(0, 6);
          
          const formattedPhotos: Photo[] = uniquePhotos.map((photo: any) => ({
            url: photo.src.large2x || photo.src.large || photo.src.medium,
            caption: photo.alt || `Discover the beauty of ${destination}`
          }));
          
          setPhotos(formattedPhotos);
          console.log(`🎯 SUCCESS: Using ${formattedPhotos.length} destination-specific photos for ${destination}`);
        } else {
          // No relevant photos found, try a general fallback search
          console.log('⚠️ No relevant photos found, trying fallback search');
          try {
            const fallbackResponse = await fetch(`https://api.pexels.com/v1/search?query=beautiful travel destination&per_page=6&orientation=landscape`, {
              headers: {
                Authorization: '1acrtV7OPRQmWjmxtM9njqOuQCe47mkyZELwrSyYbhT7BkWuIbgtL2ld'
              }
            });

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.photos && fallbackData.photos.length > 0) {
                const formattedPhotos: Photo[] = fallbackData.photos.map((photo: any) => ({
                  url: photo.src.large2x || photo.src.large || photo.src.medium,
                  caption: photo.alt || `Beautiful travel destination`
                }));
                setPhotos(formattedPhotos);
                console.log('🔄 Using fallback travel photos');
              } else {
                setPhotos(fallbackPhotos);
                console.log('📷 Using static fallback photos');
              }
            } else {
              setPhotos(fallbackPhotos);
              console.log('📷 API fallback failed, using static photos');
            }
          } catch (fallbackError) {
            console.log('❌ Fallback search failed, using static fallback photos');
            setPhotos(fallbackPhotos);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching photos:', error);
        // Use fallback photos on error
        setPhotos(fallbackPhotos);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [destination]); // This ensures re-fetch when destination changes

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
        <div className="text-gray-500 dark:text-gray-400">
          Loading {destination ? `${destination} photos` : 'destination photos'}...
        </div>
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
