
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';

const PropertyCard = () => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-gray-500">Sample Property Content</div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          Sample Property Name
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Location</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.5</span>
            <span className="text-sm text-gray-500">(123 reviews)</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">$120</div>
            <div className="text-sm text-gray-500">per night</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
