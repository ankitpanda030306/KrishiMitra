
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/translations";

const mockIncidents = [
    { id: 1, pest: 'aphids' as TranslationKey, location: 'Nashik Region', time: '2 hours ago', severity: 'high' as TranslationKey, coords: { top: '25%', left: '30%' } },
    { id: 2, pest: 'fungalBlight' as TranslationKey, location: 'Pune Farmlands', time: '8 hours ago', severity: 'medium' as TranslationKey, coords: { top: '55%', left: '25%' } },
    { id: 3, pest: 'whiteflies' as TranslationKey, location: 'Nagpur Outskirts', time: '1 day ago', severity: 'low' as TranslationKey, coords: { top: '20%', left: '70%' } },
    { id: 4, pest: 'locustSwarm' as TranslationKey, location: 'Solapur District', time: '2 days ago', severity: 'critical' as TranslationKey, coords: { top: '80%', left: '45%' } },
];

export default function PestPatrolPage() {
  const { t } = useLanguage();
  const mapImage = PlaceHolderImages.find((img) => img.id === 'pest-patrol-map');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('pestPatrol')}</h1>
        <p className="text-muted-foreground">{t('pestPatrolDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('outbreakMap')}</CardTitle>
        </CardHeader>
        <CardContent>
            {mapImage && (
                <div className="aspect-video relative rounded-lg overflow-hidden border bg-secondary/20">
                     <Image
                        src={mapImage.imageUrl}
                        alt={mapImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={mapImage.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0">
                        {mockIncidents.map(incident => (
                            <div 
                                key={incident.id} 
                                className="absolute"
                                style={{ top: incident.coords.top, left: incident.coords.left }}
                            >
                                <div className="relative group">
                                    <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
                                    <div className="absolute bottom-full mb-2 w-48 p-2 bg-popover text-popover-foreground rounded-md shadow-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <p className="font-bold">{t(incident.pest)}</p>
                                        <p>{incident.location}</p>
                                        <p className="capitalize">{t('severity')}: {t(incident.severity)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
                <CardTitle>{t('recentIncidents')}</CardTitle>
                <CardDescription>{t('latestSightings')}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {mockIncidents.map(incident => (
                        <li key={incident.id} className="p-3 rounded-lg border flex flex-col sm:flex-row sm:items-start gap-4">
                            <AlertTriangle className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <p className="font-bold text-lg">{t(incident.pest)}</p>
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
                                <p className="text-sm font-semibold text-destructive capitalize">{t(incident.severity)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>
           <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{t('reportIncident')}</CardTitle>
                <CardDescription>{t('spottedAPest')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center text-center space-y-4 p-8">
                <p>{t('byReporting')}</p>
                <Button size="lg">{t('reportIncident')}</Button>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
