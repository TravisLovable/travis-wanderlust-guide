import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface VisaData {
    visaRequired: boolean | string;
    maxStay: string;
    passportValidity: string;
    yellowFever: string;
    notes: string;
}

interface VisaPresenterProps {
    data: VisaData;
}

const VisaPresenter: React.FC<VisaPresenterProps> = ({ data }) => {
    const { visaRequired, maxStay, passportValidity, yellowFever, notes } = data;

    const isVisaFree = typeof visaRequired === 'boolean' && !visaRequired;

    return (
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg font-semibold">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mr-2">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    Visa & Entry
                    <Shield className="w-3 h-3 ml-auto text-red-400 group-hover:scale-110 transition-transform" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className={`p-2 ${isVisaFree ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'} border rounded-lg`}>
                    <div className={`font-medium text-sm ${isVisaFree ? 'text-green-700' : 'text-orange-700'}`}>
                        {isVisaFree ? '✓ Visa-free entry' : '⚠ Check visa requirements'}
                    </div>
                    <div className="text-xs text-muted-foreground">{notes}</div>
                </div>
                <div className="text-xs space-y-1">
                    <p><span className="font-medium">Max stay:</span> {maxStay}</p>
                    <p><span className="font-medium">Passport validity:</span> {passportValidity}</p>
                    <p><span className="font-medium">Yellow fever:</span> {yellowFever}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                    View Requirements
                </Button>
            </CardContent>
        </Card>
    );
};

export default VisaPresenter;
