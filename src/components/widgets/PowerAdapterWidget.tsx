import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug, Zap } from 'lucide-react';

interface PowerData {
    type: string;
    voltage: string;
    frequency: string;
}

interface PowerAdapterWidgetProps {
    powerData: PowerData;
    isAdapterSpinning: boolean;
    onAdapterClick: () => void;
}

const PowerAdapterWidget: React.FC<PowerAdapterWidgetProps> = ({
    powerData,
    isAdapterSpinning,
    onAdapterClick
}) => {
    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mr-2">
                        <Plug className="w-4 h-4 text-white" />
                    </div>
                    Power
                    <Zap className="w-3 h-3 ml-auto text-yellow-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl cursor-pointer perspective-1000"
                    onClick={onAdapterClick}
                >
                    <div
                        className={`w-12 h-16 mx-auto mb-2 relative transition-all duration-1000 transform-gpu ${isAdapterSpinning ? 'animate-spin rotate-y-180' : 'hover:rotate-y-12 hover:-translate-y-2'
                            }`}
                        style={{
                            background: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 50%, #9ca3af 100%)',
                            boxShadow: `
                0 15px 20px -5px rgba(0, 0, 0, 0.1),
                0 8px 8px -5px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
                            borderRadius: '6px',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="w-1 h-6 bg-gray-700 rounded-full shadow-md"></div>
                            <div className="w-1 h-6 bg-gray-700 rounded-full shadow-md mt-1"></div>
                        </div>
                    </div>
                    <div className="font-bold text-sm text-yellow-400">{powerData.type}</div>
                    <div className="text-xs text-muted-foreground">{powerData.voltage} • {powerData.frequency}</div>
                </div>
                <div className="text-xs space-y-1 mt-2">
                    <p><span className="font-medium">Voltage:</span> {powerData.voltage}</p>
                    <p><span className="font-medium">Frequency:</span> {powerData.frequency}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PowerAdapterWidget;
