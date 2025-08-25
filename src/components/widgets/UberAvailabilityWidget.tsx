import React, { useState, useEffect } from 'react';
import { Car, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface UberAvailabilityWidgetProps {
  destination: string;
}

interface UberData {
  available: boolean;
  city?: string;
  country?: string;
  services?: string[];
  estimatedWaitTime?: string;
  popularAlternatives?: string[];
  alternatives?: string[];
  localApps?: string[];
  publicTransport?: string;
  notes?: string;
}

const UberAvailabilityWidget = ({ destination }: UberAvailabilityWidgetProps) => {
  const [uberData, setUberData] = useState<UberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUberAvailability = async () => {
      if (!destination) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log(`🚗 Checking Uber availability for: ${destination}`);

        const { data, error: functionError } = await supabase.functions.invoke('uber-availability', {
          body: {
            destination: destination
          }
        });

        if (functionError) {
          console.error('Uber availability function error:', functionError);
          throw functionError;
        }

        setUberData(data);
        console.log(`✅ Uber availability data loaded for ${destination}:`, data);

      } catch (error) {
        console.error('Error checking Uber availability:', error);
        setError(error instanceof Error ? error.message : 'Failed to check Uber availability');
        
        // Set fallback data
        setUberData({
          available: false,
          alternatives: ['Local taxi services', 'Public transportation'],
          notes: 'Unable to verify Uber availability - check locally'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkUberAvailability();
  }, [destination]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Car className="w-5 h-5 mr-2 text-blue-500" />
            Ride Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-muted-foreground">Checking availability...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!uberData) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Car className="w-5 h-5 mr-2 text-gray-500" />
            Ride Sharing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-muted-foreground">Unable to load ride-sharing information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Car className="w-5 h-5 mr-2 text-blue-500" />
          Ride Sharing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uberData.available ? (
          <>
            {/* Uber Available */}
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">Uber Available</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>

            {/* Wait Time */}
            {uberData.estimatedWaitTime && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Estimated wait: {uberData.estimatedWaitTime}</span>
              </div>
            )}

            {/* Available Services */}
            {uberData.services && uberData.services.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Available Services:</p>
                <div className="flex flex-wrap gap-1">
                  {uberData.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {uberData.popularAlternatives && uberData.popularAlternatives.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Popular Alternatives:</p>
                <div className="text-sm text-muted-foreground">
                  {uberData.popularAlternatives.join(', ')}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Uber Not Available */}
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium">Uber Not Available</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Unavailable
              </Badge>
            </div>

            {/* Local Alternatives */}
            {uberData.alternatives && uberData.alternatives.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Transportation Options:</p>
                <div className="space-y-1">
                  {uberData.alternatives.map((alternative, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{alternative}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Apps */}
            {uberData.localApps && uberData.localApps.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Local Ride-Sharing Apps:</p>
                <div className="flex flex-wrap gap-1">
                  {uberData.localApps.map((app, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Public Transport */}
            {uberData.publicTransport && (
              <div>
                <p className="text-sm font-medium mb-2">Public Transport:</p>
                <p className="text-sm text-muted-foreground">{uberData.publicTransport}</p>
              </div>
            )}
          </>
        )}

        {/* Notes */}
        {uberData.notes && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">{uberData.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UberAvailabilityWidget;