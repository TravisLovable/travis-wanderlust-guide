import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';

interface VisaData {
    visaRequired: boolean | string;
    maxStay?: string;
    passportValidity?: string;
    yellowFever?: string;
    notes?: string;
    reason?: string;
    processingTime?: string;
    cost?: string;
    exceptions?: string;
    requiresETA?: boolean;
    recommendation?: string;
    isLoading?: boolean;
    error?: string;
}

interface VisaPresenterProps {
    data: VisaData;
}

const VisaPresenter: React.FC<VisaPresenterProps> = ({ data }) => {
    const { 
        visaRequired, 
        maxStay, 
        passportValidity, 
        yellowFever, 
        notes, 
        reason,
        processingTime,
        cost,
        exceptions,
        requiresETA,
        recommendation,
        isLoading,
        error
    } = data;

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                        <Shield className="w-5 h-5 mr-2 text-blue-500" />
                        Visa & Entry
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Checking requirements...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isVisaFree = typeof visaRequired === 'boolean' && !visaRequired;
    const needsVisa = typeof visaRequired === 'boolean' && visaRequired;
    const isUnknown = visaRequired === 'unknown' || typeof visaRequired === 'string';

    const getStatusColor = () => {
        if (isVisaFree) return 'green';
        if (needsVisa) return 'red';
        return 'yellow';
    };

    const getStatusIcon = () => {
        if (isVisaFree) return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (needsVisa) return <XCircle className="w-5 h-5 text-red-500" />;
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    };

    const getStatusText = () => {
        if (isVisaFree) return requiresETA ? 'Visa-free (ETA required)' : 'Visa-free entry';
        if (needsVisa) return reason || 'Visa required';
        return 'Check requirements';
    };

    const statusColor = getStatusColor();

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Shield className="w-5 h-5 mr-2 text-blue-500" />
                    Visa & Entry
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status Header */}
                <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span className="font-medium">{getStatusText()}</span>
                    <Badge 
                        variant="secondary" 
                        className={`${
                            statusColor === 'green' ? 'bg-green-100 text-green-800' :
                            statusColor === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                        {isVisaFree ? 'Free' : needsVisa ? 'Required' : 'Check'}
                    </Badge>
                </div>

                {/* Visa Required Information */}
                {needsVisa && (
                    <div className="space-y-2">
                        {processingTime && (
                            <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Processing: {processingTime}</span>
                            </div>
                        )}
                        {cost && (
                            <div className="flex items-center space-x-2 text-sm">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span>Cost: {cost}</span>
                            </div>
                        )}
                        {exceptions && (
                            <div className="text-sm text-blue-600">
                                <span className="font-medium">Note:</span> {exceptions}
                            </div>
                        )}
                    </div>
                )}

                {/* Visa-free Information */}
                {(isVisaFree || isUnknown) && (
                    <div className="space-y-2 text-sm">
                        {maxStay && (
                            <div>
                                <span className="font-medium">Max stay:</span> {maxStay}
                            </div>
                        )}
                        {passportValidity && (
                            <div>
                                <span className="font-medium">Passport validity:</span> {passportValidity}
                            </div>
                        )}
                        {yellowFever && (
                            <div>
                                <span className="font-medium">Yellow fever:</span> {yellowFever}
                            </div>
                        )}
                    </div>
                )}

                {/* Special Requirements */}
                {requiresETA && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                            Electronic Travel Authorization Required
                        </div>
                        <div className="text-xs text-blue-600">
                            Must be obtained before travel
                        </div>
                    </div>
                )}

                {/* Notes */}
                {notes && (
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm text-gray-700">{notes}</div>
                    </div>
                )}

                {/* Error Warning */}
                {error && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-xs text-yellow-700">{error}</div>
                    </div>
                )}

                {/* Recommendation */}
                {recommendation && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                        {recommendation}
                    </div>
                )}

                {/* Action Button */}
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => {
                        // In a real app, this would open official visa information
                        window.open('https://travel.state.gov/content/travel/en/international-travel.html', '_blank');
                    }}
                >
                    View Official Requirements
                </Button>
            </CardContent>
        </Card>
    );
};

export default VisaPresenter;
