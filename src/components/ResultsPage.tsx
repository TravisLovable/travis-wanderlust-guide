
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Thermometer, Clock, CreditCard, Plane, Car, Umbrella, Globe, Shield, Mountain, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsPageProps {
  destination: string;
  dates: { checkin: string; checkout: string };
  onBack: () => void;
}

const ResultsPage = ({ destination, dates, onBack }: ResultsPageProps) => {
  const [currencyAmount, setCurrencyAmount] = useState(100);
  const [selectedWidgets, setSelectedWidgets] = useState(['currency', 'weather', 'time']);

  // Mock data - in a real app, this would come from APIs
  const mockData = {
    currency: { rate: 0.85, symbol: '€', name: 'Euro' },
    time: { current: '15:42', offset: '+2', dst: true },
    weather: { temp: 22, condition: 'Sunny', humidity: 65 },
    airport: { code: 'CDG', name: 'Charles de Gaulle Airport', address: 'Roissy-en-France' },
    altitude: { elevation: '35m above sea level' },
    emergency: { police: '17', fire: '18', medical: '15' }
  };

  const widgetOptions = [
    { id: 'currency', name: 'Currency', icon: CreditCard },
    { id: 'weather', name: 'Weather', icon: Thermometer },
    { id: 'time', name: 'Time', icon: Clock },
    { id: 'transport', name: 'Transport', icon: Car },
    { id: 'emergency', name: 'Emergency', icon: Shield },
    { id: 'connectivity', name: 'Wi-Fi', icon: Wifi }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                  {destination}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {dates.checkin} to {dates.checkout}
                </p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">Travis</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Currency Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Currency Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">1 USD</span>
                  <span className="text-green-700 font-bold">
                    {mockData.currency.rate} {mockData.currency.symbol}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={currencyAmount}
                    onChange={(e) => setCurrencyAmount(Number(e.target.value))}
                    className="flex-1"
                  />
                  <div className="px-3 py-2 bg-gray-100 rounded border">
                    {mockData.currency.symbol}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  = {mockData.currency.symbol}{(currencyAmount * mockData.currency.rate).toFixed(2)} {mockData.currency.name}
                </p>
                <div className="text-xs text-gray-500">
                  Last updated: 2 minutes ago
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Zone Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Time Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Your Time</div>
                    <div className="text-xl font-bold">14:42</div>
                    <div className="text-xs text-gray-600">EST</div>
                  </div>
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">{destination}</div>
                    <div className="text-xl font-bold text-blue-700">{mockData.time.current}</div>
                    <div className="text-xs text-gray-600">CET {mockData.time.offset}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {mockData.time.dst && (
                    <p className="flex items-center">
                      <Mountain className="w-4 h-4 mr-1" />
                      Daylight Saving Time is active
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Thermometer className="w-5 h-5 mr-2 text-orange-600" />
                Weather Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-700">{mockData.weather.temp}°C</div>
                  <div className="text-sm text-gray-600">{mockData.weather.condition}</div>
                  <div className="text-xs text-gray-500 mt-2">Humidity: {mockData.weather.humidity}%</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">Tomorrow</div>
                    <div className="text-gray-600">25°C</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">Thu</div>
                    <div className="text-gray-600">23°C</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">Fri</div>
                    <div className="text-gray-600">27°C</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Airport Info Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Plane className="w-5 h-5 mr-2 text-purple-600" />
                Airport Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-bold text-lg text-purple-700">{mockData.airport.code}</div>
                  <div className="text-sm font-medium">{mockData.airport.name}</div>
                  <div className="text-xs text-gray-600">{mockData.airport.address}</div>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Distance to city:</span> 25 km</p>
                  <p><span className="font-medium">Travel time:</span> 35-45 minutes</p>
                  <p><span className="font-medium">Transportation:</span> Train, Bus, Taxi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transportation Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Car className="w-5 h-5 mr-2 text-indigo-600" />
                Transportation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-50 rounded-lg text-center">
                    <div className="font-medium text-indigo-700">Uber</div>
                    <div className="text-xs text-gray-600">Available</div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg text-center">
                    <div className="font-medium text-indigo-700">Metro</div>
                    <div className="text-xs text-gray-600">Extensive</div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Local taxi:</span> +33 1 45 30 30 30</p>
                  <p><span className="font-medium">Metro day pass:</span> €7.50</p>
                  <p><span className="font-medium">Bike sharing:</span> Vélib' available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visa & Entry Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Visa & Entry Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-green-700 font-medium">✓ Visa-free entry</div>
                  <div className="text-xs text-gray-600">For US passport holders</div>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Max stay:</span> 90 days</p>
                  <p><span className="font-medium">Passport validity:</span> 6+ months</p>
                  <p><span className="font-medium">Required docs:</span> Return ticket</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Full Requirements
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cultural Insights Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Globe className="w-5 h-5 mr-2 text-teal-600" />
                Cultural Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <h4 className="font-medium text-teal-700 mb-2">Etiquette Tips</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Greeting with cheek kisses is common</li>
                      <li>• Dress modestly when visiting churches</li>
                      <li>• Tipping 10-15% at restaurants</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <h4 className="font-medium text-teal-700 mb-2">Upcoming Holidays</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Bastille Day - July 14</li>
                      <li>• Assumption Day - August 15</li>
                      <li>• All Saints' Day - November 1</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Info Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Emergency Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-bold text-red-700">{mockData.emergency.police}</div>
                    <div className="text-xs text-gray-600">Police</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-bold text-red-700">{mockData.emergency.fire}</div>
                    <div className="text-xs text-gray-600">Fire</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-bold text-red-700">{mockData.emergency.medical}</div>
                    <div className="text-xs text-gray-600">Medical</div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">US Embassy:</span> +33 1 43 12 22 22</p>
                  <p><span className="font-medium">Tourist Police:</span> +33 1 53 71 53 71</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connectivity Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Wifi className="w-5 h-5 mr-2 text-cyan-600" />
                Connectivity & ATMs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <h4 className="font-medium text-cyan-700 mb-2">Free Wi-Fi Spots</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• All major cafés and restaurants</li>
                    <li>• Metro stations and airports</li>
                    <li>• Public libraries and parks</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">ATM Locations:</p>
                  <p className="text-gray-600">Widely available. Major banks: BNP Paribas, Crédit Agricole, Société Générale</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget Preview Card */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                Quick Access Widgets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-3">Select your preferred quick-access modules:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {widgetOptions.map((widget) => {
                    const Icon = widget.icon;
                    const isSelected = selectedWidgets.includes(widget.id);
                    return (
                      <button
                        key={widget.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedWidgets(selectedWidgets.filter(id => id !== widget.id));
                          } else {
                            setSelectedWidgets([...selectedWidgets, widget.id]);
                          }
                        }}
                        className={`p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{widget.name}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    Selected widgets will appear in your travel dashboard for quick access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
