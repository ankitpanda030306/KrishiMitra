'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bug, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';
import { getLivePestIncidents, GetLivePestIncidentsOutput } from '@/ai/flows/get-live-pest-incidents';
import { Skeleton } from '../ui/skeleton';

type Incident = GetLivePestIncidentsOutput['incidents'][0];

export default function PestPatrolSummary() {
  const { t, language } = useLanguage();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = (latitude: number, longitude: number) => {
      setLoading(true);
      setError(null);
      getLivePestIncidents({ latitude, longitude, language })
        .then(result => {
          if (result && result.incidents) {
            // Take top 3 for the summary view
            setIncidents(result.incidents.slice(0, 3));
          } else {
            throw new Error("No incidents returned");
          }
        })
        .catch(e => {
            if (e.message && e.message.includes('model is overloaded')) {
              setError(t('aiServiceOverloaded'));
            } else {
              setError(t('incidentFetchError'));
            }
            console.error("Failed to fetch live incidents:", e);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchIncidents(position.coords.latitude, position.coords.longitude),
        () => {
          setError(t('locationAccessDenied'));
          setLoading(false);
        }
      );
    } else {
      setError(t('geolocationNotSupported'));
      setLoading(false);
    }

  }, [language, t]);

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="text-primary" />
          {t('pestPatrolAlerts')}
        </CardTitle>
        <CardDescription>{t('recentThreats')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading && (
          <ul className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Skeleton className="w-5 h-5 mt-1" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </li>
              ))}
          </ul>
        )}
        {error && (
            <div className="flex flex-col items-center justify-center text-center text-destructive p-4 border border-destructive/50 rounded-lg h-full">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p className="font-semibold">{t('error')}</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        {!loading && !error && incidents.length > 0 && (
          <ul className="space-y-4">
            {incidents.map((alert, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold">{alert.pest}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.location} - <span className="capitalize">{t((alert.severity || 'low') as any)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
         {!loading && !error && incidents.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t('noIncidents')}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/dashboard/pest-patrol">{t('viewMap')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
