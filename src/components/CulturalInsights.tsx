
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Church, Heart, Utensils } from 'lucide-react';

interface CulturalInsightsProps {
  mockData: {
    culture: {
      language: {
        primary: string;
        secondary: string;
      };
      religion: {
        primary: string;
        secondary: string;
      };
      etiquette: string[];
      customs: string[];
    };
  };
}

const CulturalInsights = ({ mockData }: CulturalInsightsProps) => {
  return (
    <Card className="travis-card bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl font-semibold">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2">
            <Globe className="w-4 h-4 text-white" />
          </div>
          Cultural Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Language */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Globe className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-blue-700">Language</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs"><span className="font-medium">Primary:</span> {mockData.culture.language.primary}</p>
              <p className="text-xs"><span className="font-medium">Secondary:</span> {mockData.culture.language.secondary}</p>
            </div>
          </div>

          {/* Religion */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Church className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-purple-700">Religion</h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs"><span className="font-medium">Primary:</span> {mockData.culture.religion.primary}</p>
              <p className="text-xs"><span className="font-medium">Other:</span> {mockData.culture.religion.secondary}</p>
            </div>
          </div>

          {/* Cultural Etiquette */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-green-700">Etiquette</h3>
            </div>
            <div className="space-y-1">
              {mockData.culture.etiquette.slice(0, 3).map((rule, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">• {rule}</p>
              ))}
            </div>
          </div>

          {/* Local Customs */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Utensils className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-orange-700">Customs</h3>
            </div>
            <div className="space-y-1">
              {mockData.culture.customs.slice(0, 3).map((custom, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">• {custom}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CulturalInsights;
