
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { AlertTriangle, MapPin, Clock, Construction, ChevronDown } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/translations";
import { getLivePestIncidents, GetLivePestIncidentsOutput } from '@/ai/flows/get-live-pest-incidents';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Incident = GetLivePestIncidentsOutput['incidents'][0] & { id: number };

export default function PestPatrolPage() {
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
            setIncidents(result.incidents.map((inc, index) => ({...inc, id: index })));
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

  const severityMapping: {[key: string]: TranslationKey} = {
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'critical': 'critical',
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('pestPatrol')}</h1>
        <p className="text-muted-foreground">{t('pestPatrolDescription')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('outbreakMap')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-secondary/20 flex flex-col items-center justify-center text-center p-8">
              <Construction className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold font-headline text-foreground">Feature Coming Soon!</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                We are working hard to bring you an interactive pest outbreak map. Stay tuned for updates!
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
                <CardTitle>{t('recentIncidents')}</CardTitle>
                <CardDescription>{t('latestSightings')}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && (
                    <ul className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <li key={i} className="p-3 rounded-lg border flex items-start gap-4">
                            <Skeleton className="h-8 w-8 mt-1" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-5 w-1/4" />
                          </li>
                        ))}
                    </ul>
                )}
                {error && (
                    <div className="flex flex-col items-center justify-center text-center text-destructive p-4 border border-destructive/50 rounded-lg">
                        <AlertTriangle className="w-8 h-8 mb-2" />
                        <p className="font-semibold">{t('error')}</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {!loading && !error && incidents.length > 0 && (
                  <Accordion type="single" collapsible className="w-full space-y-2">
                      {incidents.map(incident => (
                        <AccordionItem value={`item-${incident.id}`} key={incident.id} className="p-3 rounded-lg border bg-card">
                          <AccordionTrigger className="w-full text-left hover:no-underline py-1">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1">
                                <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-lg">{incident.pest}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{incident.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{incident.time}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-destructive capitalize">{t(severityMapping[incident.severity] || incident.severity as any)}</p>
                                </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pl-12 pr-4 text-muted-foreground text-sm">
                            {incident.description}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                )}
                {!loading && !error && incidents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">{t('noIncidents')}</p>
                )}
            </CardContent>
          </Card>
           <Card className="flex flex-col flex-grow">
            <CardHeader>
                <CardTitle>{t('reportIncident')}</CardTitle>
                <CardDescription>{t('spottedAPest')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center space-y-4 p-8">
                <p className="max-w-xs">{t('byReporting')}</p>
                <Button size="lg">{t('reportIncident')}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
