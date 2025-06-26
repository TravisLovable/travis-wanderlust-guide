import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, CreditCard, Plane, Shield, Car, CalendarDays, Plug, Wifi, 
  Zap, TrendingUp, Mountain, Palette, Users 
} from 'lucide-react';

interface WidgetData {
  worldClockData: any;
  isLoadingWorldClock: boolean;
  currencyData: any;
  currencyLoading: boolean;
  currencyError: any;
  currencyAmount: number;
  setCurrencyAmount: (amount: number) => void;
  holidayData: any;
  isLoadingHolidays: boolean;
  destination: string;
  dates: { checkin: string; checkout: string };
  mockData: any;
  selectedWidgets: string[];
  setSelectedWidgets: (widgets: string[]) => void;
  isAdapterSpinning: boolean;
  handleAdapterClick: () => void;
}

interface WidgetsGridProps extends WidgetData {}

const WidgetsGrid = ({
  worldClockData,
  isLoadingWorldClock,
  currencyData,
  currencyLoading,
  currencyError,
  currencyAmount,
  setCurrencyAmount,
  holidayData,
  isLoadingHolidays,
  destination,
  dates,
  mockData,
  selectedWidgets,
  setSelectedWidgets,
  isAdapterSpinning,
  handleAdapterClick
}: WidgetsGridProps) => {

  return (
    <>
      {/* Row 1: Primary Info Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-6">
        {/* Time Zone Widget */}
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-semibold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-2">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Time Zone
              <Zap className="w-3 h-3 ml-auto text-blue-400 group-hover:scale-110 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingWorldClock ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="text-xs text-muted-foreground mb-1 font-medium">YOUR TIME</div>
                    <div className="text-lg font-bold text-blue-400">
                      {worldClockData?.origin.time12 || '4:50 PM'}
                    </div>
                    <div className="text-xs text-muted-foreground opacity-75">
                      {worldClockData?.origin.time || '16:50'}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {worldClockData?.origin.abbreviation || 'CST'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                    <div className="text-xs text-muted-foreground mb-1 font-medium uppercase">
                      {destination.split(',')[0]}
                    </div>
                    <div className="text-lg font-bold text-blue-300">
                      {worldClockData?.destination.time12 || '4:50 PM'}
                    </div>
                    <div className="text-xs text-muted-foreground opacity-75">
                      {worldClockData?.destination.time || '16:50'}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {worldClockData?.destination.abbreviation || 'PET'}
                    </div>
                  </div>
                </div>
                {worldClockData && (
                  <div className="flex items-center justify-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <Clock className="w-3 h-3 mr-1 text-blue-400" />
                    <span className="text-xs text-blue-400 font-medium">
                      {worldClockData.timeDifferenceText}
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Currency Widget */}
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-semibold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-2">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              Currency
              <TrendingUp className="w-3 h-3 ml-auto text-green-400 group-hover:scale-110 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currencyLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <span className="font-semibold text-sm">1 USD</span>
                  <span className="text-green-400 font-bold text-sm">
                    {currencyData?.rate.toFixed(2)} {currencyData?.symbol}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={currencyAmount}
                    onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                    className="flex-1 bg-secondary/30 border-border/50 focus:border-green-400 rounded-xl h-8 text-sm"
                  />
                  <span className="text-green-400 font-semibold text-sm">
                    = {currencyData?.symbol}{currencyData ? (currencyAmount * currencyData.rate).toFixed(2) : '-.--'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {currencyError ? (
                    <span className="text-orange-400">API Error - Using fallback</span>
                  ) : (
                    `Live rate • ${currencyData?.lastUpdated}`
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Airport Info Widget */}
        <Card className="travis-card travis-interactive group bg-black dark:bg-black border-gray-600 dark:border-gray-600 shadow-lg dark:shadow-gray-500/20 lg:col-span-2 xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-semibold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mr-2">
                <Plane className="w-4 h-4 text-white" />
              </div>
              Airport
              <Plane className="w-3 h-3 ml-auto text-purple-400 group-hover:scale-110 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <div className="font-bold text-lg text-purple-700">{mockData.airport.code}</div>
              <div className="text-sm font-medium">{mockData.airport.name}</div>
              <div className="text-xs text-muted-foreground">{mockData.airport.address}</div>
            </div>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">Distance:</span> 25 km</p>
              <p><span className="font-medium">Travel time:</span> 45-90 min</p>
              <p><span className="font-medium">Options:</span> Metro, Bus, Taxi</p>
            </div>
          </CardContent>
        </Card>

        {/* Visa & Entry Widget */}
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
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-green-700 font-medium text-sm">✓ Visa-free entry</div>
              <div className="text-xs text-muted-foreground">For US passport holders</div>
            </div>
            <div className="text-xs space-y-1">
              <p><span className="font-medium">Max stay:</span> 90 days</p>
              <p><span className="font-medium">Passport validity:</span> 6 months minimum</p>
              <p><span className="font-medium">Yellow fever:</span> Vaccination recommended</p>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Requirements
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default WidgetsGrid;
