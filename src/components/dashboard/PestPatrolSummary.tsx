'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bug, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import Link from 'next/link';

const mockAlerts = [
  { id: 1, threatKey: 'aphidOutbreak', distance: '5', severityKey: 'high' },
  { id: 2, threatKey: 'fungalBlight', distance: '12', severityKey: 'medium' },
  { id: 3, threatKey: 'locustSwarm', distance: '18', severityKey: 'high' },
] as const;

export default function PestPatrolSummary() {
  const { t } = useLanguage();

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
        <ul className="space-y-4">
          {mockAlerts.map((alert) => (
            <li key={alert.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 pt-1">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold">{t(alert.threatKey)}</p>
                <p className="text-sm text-muted-foreground">
                  {alert.distance} {t('kmAway')} - {t('severity')}: {t(alert.severityKey)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/dashboard/pest-patrol">{t('viewMap')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
