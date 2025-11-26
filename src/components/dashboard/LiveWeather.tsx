
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

  // Use the correct environment variable for the API key
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  useEffect(() => {
    // This check runs first. If the key is missing, we show a specific error.
    if (!apiKey) {
      setError("OpenWeather API key is missing. Please add it to your .env file.");
      setLoading(false);
      return;
    }

    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=${language}`);
        if (!response.ok) {
          // This will now only be thrown for actual API errors, not missing keys.
          throw new Error('Failed to fetch weather data from API.');
        }
        const data = await response.json();
        
        setWeather({
          location: data.name,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        });
      } catch (e: any) {
        console.error(e);
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
    
    // We only try to get the position if the apiKey exists.
    getPosition();

  }, [t, language, apiKey]);

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
