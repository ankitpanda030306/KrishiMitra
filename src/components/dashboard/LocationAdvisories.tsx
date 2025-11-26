"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, SprayCan, Sprout, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { provideLocationBasedAdvisories, ProvideLocationBasedAdvisoriesOutput } from '@/ai/flows/provide-location-based-advisories';
import { Skeleton } from '../ui/skeleton';

export default function LocationAdvisories() {
  const { t } = useLanguage();
  const [advisories, setAdvisories] = useState<ProvideLocationBasedAdvisoriesOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAdvisories = () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await provideLocationBasedAdvisories({ latitude, longitude });
            setAdvisories(result);
          } catch (e) {
            setError("Failed to fetch advisories from AI service.");
            console.error(e);
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Unable to retrieve your location. Please enable location services.");
          setLoading(false);
        }
      );
    };

    getAdvisories();
  }, []);

  const advisoryItems = [
    {
      icon: Droplets,
      title: t('irrigation'),
      content: advisories?.irrigationAdvisory,
    },
    {
      icon: SprayCan,
      title: t('sprayTiming'),
      content: advisories?.sprayTimingAdvisory,
    },
    {
      icon: Sprout,
      title: t('plantingHarvesting'),
      content: advisories?.plantingHarvestingAdvisory,
    },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{t('locationAdvisories')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            <div className="flex items-start gap-4"><Skeleton className="w-8 h-8 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-3/4" /></div></div>
            <div className="flex items-start gap-4"><Skeleton className="w-8 h-8 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-4/5" /></div></div>
            <div className="flex items-start gap-4"><Skeleton className="w-8 h-8 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-2/3" /></div></div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center text-center text-destructive p-4 border border-destructive/50 rounded-lg">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && advisories && (
          <ul className="space-y-4">
            {advisoryItems.map((item, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
