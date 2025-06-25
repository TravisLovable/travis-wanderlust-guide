
import React from 'react';
import { getContextualDestinations } from '@/utils/contextualDestinationSuggestions';

interface PinnedDestinationsProps {
  pinnedDestinations: string[];
  destination: string;
  onDestinationSelect: (dest: string) => void;
  onPinDestination: (dest: string) => void;
  onRemovePinned: (dest: string) => void;
}

const PinnedDestinations = ({
  pinnedDestinations,
  destination,
  onDestinationSelect,
  onPinDestination,
  onRemovePinned
}: PinnedDestinationsProps) => {
  const getRegionalDestinations = (currentDest: string) => {
    return getContextualDestinations(currentDest);
  };

  if (pinnedDestinations.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-3">
        <span className="text-sm text-muted-foreground font-medium">PINNED:</span>
        <div className="flex space-x-2 flex-wrap">
          {pinnedDestinations.map((dest) => (
            <button
              key={dest}
              onClick={() => onDestinationSelect(dest)}
              className="group flex items-center space-x-2 px-3 py-1 bg-blue-600/30 border border-blue-500/30 rounded-full text-sm text-white hover:bg-blue-700/40 transition-colors shadow-sm"
            >
              <span>{dest}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePinned(dest);
                }}
                className="w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          {getRegionalDestinations(destination).map((city) => (
            <button
              key={city}
              onClick={() => onPinDestination(city)}
              className="px-2 py-1 bg-green-600/30 border border-green-500/30 rounded text-xs text-white hover:bg-green-700/40 transition-colors shadow-sm"
              title="Click to pin"
            >
              + {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinnedDestinations;
