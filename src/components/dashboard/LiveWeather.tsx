"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Sun, Cloud, CloudRain, CloudSnow, Wind, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Snowy' | 'Windy';

interface WeatherData {
  location: string;
  temperature: number;
  condition: WeatherCondition;
}

const WeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
  switch (condition) {
    case 'Sunny':
      return <Sun className="w-10 h-10 text-yellow-500 animate-spin-slow" />;
    case 'Cloudy':
      return <Cloud className="w-10 h-10 text-gray-500 animate-pulse" />;
    case 'Rainy':
      return <CloudRain className="w-10 h-10 text-blue-500 animate-bounce" />;
    case 'Snowy':
      return <CloudSnow className="w-10 h-10 text-blue-200" />;
    case 'Windy':
      return <Wind className="w-10 h-10 text-gray-400" />;
    default:
      return <Sun className="w-10 h-10 text-yellow-500" />;
  }
};

export default function LiveWeather() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        // In a real application, you would call a weather API here.
        // For this demo, we'll use mock data and a reverse geocoding approximation.
        // This is a mock reverse geocoding call.
        const mockLocation = "Bhubaneswar"; 
        const mockConditions: WeatherCondition[] = ['Sunny', 'Cloudy', 'Rainy', 'Windy'];
        const randomCondition = mockConditions[Math.floor(Math.random() * mockConditions.length)];
        const randomTemp = Math.floor(Math.random() * 15) + 20; // Temp between 20 and 35

        setWeather({
          location: mockLocation,
          temperature: randomTemp,
          condition: randomCondition,
        });
      } catch (e) {
        setError(t('weatherFetchError'));
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError(t('locationAccessDenied'));
          setLoading(false);
        }
      );
    } else {
      setError(t('geolocationNotSupported'));
      setLoading(false);
    }
  }, [t]);

  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        {loading && (
          <div className="flex items-center justify-center gap-4 h-24">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('fetchingWeather')}</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center text-center text-destructive h-24">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <p className="font-semibold">{t('error')}</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!loading && weather && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <WeatherIcon condition={weather.condition} />
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <p className="font-semibold">{weather.location}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{weather.temperature}°C</p>
                <p className="text-sm text-muted-foreground">{t(weather.condition.toLowerCase() as TranslationKey)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
