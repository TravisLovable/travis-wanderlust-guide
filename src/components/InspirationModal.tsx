import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Compass } from 'lucide-react';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDestinationSelect: (destination: string) => void;
}

const inspirationalDestinations = [
  {
    name: 'Tokyo, Japan',
    description: 'Modern metropolis meets ancient tradition',
    category: 'Cultural'
  },
  {
    name: 'Paris, France',
    description: 'City of lights and romance',
    category: 'Cultural'
  },
  {
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with rich culture',
    category: 'Adventure'
  },
  {
    name: 'New York, USA',
    description: 'The city that never sleeps',
    category: 'Business'
  },
  {
    name: 'São Paulo, Brazil',
    description: 'South America\'s vibrant cultural hub',
    category: 'Cultural'
  },
  {
    name: 'Dubai, UAE',
    description: 'Luxury and innovation in the desert',
    category: 'Luxury'
  },
  {
    name: 'Barcelona, Spain',
    description: 'Art, architecture, and Mediterranean charm',
    category: 'Cultural'
  },
  {
    name: 'Singapore',
    description: 'Garden city of the future',
    category: 'Business'
  },
  {
    name: 'Cape Town, South Africa',
    description: 'Where mountains meet the ocean',
    category: 'Adventure'
  },
  {
    name: 'Bangkok, Thailand',
    description: 'Street food capital and cultural gateway',
    category: 'Cultural'
  }
];

const InspirationModal: React.FC<InspirationModalProps> = ({ 
  isOpen, 
  onClose, 
  onDestinationSelect 
}) => {
  const handleDestinationClick = (destination: string) => {
    onDestinationSelect(destination);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Compass className="w-5 h-5" />
            <span>Travel Inspiration</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-6">
            Discover amazing destinations around the world. Click any destination to start planning your trip.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inspirationalDestinations.map((dest, index) => (
              <button
                key={index}
                onClick={() => handleDestinationClick(dest.name)}
                className="text-left p-4 rounded-lg border border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200 group"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-500 mt-0.5 group-hover:text-blue-400 transition-colors" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-foreground/90">
                      {dest.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dest.description}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
                      {dest.category}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspirationModal;
