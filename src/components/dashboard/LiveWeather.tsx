
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
}

export default function LiveWeather() {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_WEATHERAPI_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("WeatherAPI.com API key is missing. Please add NEXT_PUBLIC_WEATHERAPI_API_KEY to your .env file.");
      setLoading(false);
      return;
    }

    const fetchWeather = async (latitude: number, longitude: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&lang=${language}`);
        const data = await response.json();

        if (!response.ok) {
          // Throw an error with the message from the API if available
          throw new Error(data.error?.message || 'Failed to fetch weather data from API.');
        }
        
        setWeather({
          location: data.location.name,
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          icon: `https:${data.current.condition.icon}`,
        });
      } catch (e: any) {
        console.error("Weather fetch error:", e);
        setError(e.message || t('weatherFetchError'));
      } finally {
        setLoading(false);
      }
    };

    const getPosition = () => {
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
    }
    
    getPosition();

  }, [t, language, apiKey]);

  return (
    <Card>
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
                <div className="relative h-16 w-16">
                    <Image 
                        src={weather.icon}
                        alt={weather.condition}
                        fill
                        className="object-contain"
                    />
                </div>
              <div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <p className="font-semibold">{weather.location}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{weather.temperature}°C</p>
                <p className="text-sm text-muted-foreground capitalize">{weather.condition}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
