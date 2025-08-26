import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Church, Heart, Utensils } from 'lucide-react';
import { Destination } from '@/types/destination';

interface CulturalData {
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
}

interface CulturalPresenterProps {
    data: CulturalData | null;
    destination: Destination;
}

const CulturalPresenter: React.FC<CulturalPresenterProps> = ({ data, destination }) => {
    if (!data) {
        return (
            <Card className="travis-card bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-xl font-semibold">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mr-2">
                            <Globe className="w-4 h-4 text-white" />
                        </div>
                        Cultural Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Cultural insights are currently unavailable for this destination.</h3>
                        <p className="text-muted-foreground">
                            We're working to expand our cultural database to include more destinations.
                            Check back soon for detailed cultural insights for {destination.displayName}.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

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
                            <p className="text-xs"><span className="font-medium">Primary:</span> {data.language.primary}</p>
                            <p className="text-xs"><span className="font-medium">Secondary:</span> {data.language.secondary}</p>
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
                            <p className="text-xs"><span className="font-medium">Primary:</span> {data.religion.primary}</p>
                            <p className="text-xs"><span className="font-medium">Other:</span> {data.religion.secondary}</p>
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
                            {data.etiquette.slice(0, 3).map((rule, idx) => (
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
                            {data.customs.slice(0, 3).map((custom, idx) => (
                                <p key={idx} className="text-xs text-muted-foreground">• {custom}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CulturalPresenter;
