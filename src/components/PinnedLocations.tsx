import React from 'react';
import { Pin, MapPin, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePinnedLocations, PinnedLocation } from '@/hooks/usePinnedLocations';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

interface PinnedLocationsProps {
  onLocationSelect?: (place: SelectedPlace) => void;
  className?: string;
  compact?: boolean;
}

const PinnedLocations: React.FC<PinnedLocationsProps> = ({ 
  onLocationSelect, 
  className = "",
  compact = false 
}) => {
  const { pinnedLocations, unpinLocation, toSelectedPlace } = usePinnedLocations();

  const handleLocationClick = (pinned: PinnedLocation) => {
    if (onLocationSelect) {
      const selectedPlace = toSelectedPlace(pinned);
      onLocationSelect(selectedPlace);
    }
  };

  const getCountryFlag = (location: PinnedLocation) => {
    const dest = location.formatted_address.toLowerCase();
    
    // Simple flag mapping - you can expand this based on your existing logic
    if (dest.includes('south africa') || dest.includes('cape town') || dest.includes('johannesburg')) {
      return '🇿🇦';
    }
    if (dest.includes('united states') || dest.includes('usa') || dest.includes('new york') || dest.includes('los angeles')) {
      return '🇺🇸';
    }
    if (dest.includes('united kingdom') || dest.includes('london') || dest.includes('england')) {
      return '🇬🇧';
    }
    if (dest.includes('france') || dest.includes('paris')) {
      return '🇫🇷';
    }
    if (dest.includes('japan') || dest.includes('tokyo')) {
      return '🇯🇵';
    }
    if (dest.includes('italy') || dest.includes('rome') || dest.includes('milan')) {
      return '🇮🇹';
    }
    if (dest.includes('spain') || dest.includes('madrid') || dest.includes('barcelona')) {
      return '🇪🇸';
    }
    if (dest.includes('germany') || dest.includes('berlin') || dest.includes('munich')) {
      return '🇩🇪';
    }
    if (dest.includes('australia') || dest.includes('sydney') || dest.includes('melbourne')) {
      return '🇦🇺';
    }
    if (dest.includes('canada') || dest.includes('toronto') || dest.includes('vancouver')) {
      return '🇨🇦';
    }
    
    return null;
  };

  if (pinnedLocations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Pin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No pinned locations yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Pin locations from search results to access them quickly
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {pinnedLocations.map((location) => (
          <button
            key={location.id}
            onClick={() => handleLocationClick(location)}
            className="group w-full flex items-center justify-between p-3 bg-card hover:bg-secondary/50 rounded-lg border border-border/30 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getCountryFlag(location) ? (
                <span className="text-lg flex-shrink-0">{getCountryFlag(location)}</span>
              ) : (
                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-foreground truncate">
                  {location.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {location.formatted_address}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                unpinLocation(location.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </button>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Pin className="w-5 h-5 text-blue-400" />
          <span>Pinned Locations</span>
          <span className="text-sm text-muted-foreground">({pinnedLocations.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pinnedLocations.map((location) => (
          <div
            key={location.id}
            className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-border/30 transition-all duration-200 hover:shadow-md cursor-pointer"
            onClick={() => handleLocationClick(location)}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getCountryFlag(location) ? (
                <span className="text-xl flex-shrink-0 hover:animate-wiggle transition-all duration-300">
                  {getCountryFlag(location)}
                </span>
              ) : (
                <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 hover:animate-bounce-gentle transition-all duration-300" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground group-hover:text-foreground/90 truncate">
                  {location.name}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {location.formatted_address}
                </div>
                <div className="text-xs text-muted-foreground/70 mt-1">
                  Pinned {new Date(location.pinnedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                unpinLocation(location.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive interactive-scale"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        {pinnedLocations.length >= 8 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
            Showing your most recent pinned locations
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PinnedLocations;