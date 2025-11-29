
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scan, Mic } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function QuickActions() {
  const { t } = useLanguage();
  const router = useRouter();

  const buttonClasses =
    'w-full transition-transform transform active:scale-95';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-between gap-4 p-6 border rounded-lg bg-card hover:bg-secondary transition-colors">
          <div className="flex flex-col items-center gap-2 text-center">
            <Scan className="w-12 h-12 text-primary" />
            <p className="font-semibold">{t('analyzeImage')}</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/image-analysis')}
            className={cn(buttonClasses)}
          >
            {t('use')}
          </Button>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 p-6 border rounded-lg bg-card hover:bg-secondary transition-colors">
          <div className="flex flex-col items-center gap-2 text-center">
            <Mic className="w-12 h-12 text-primary" />
            <p className="font-semibold">{t('useVoiceInput')}</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/voice-analysis')}
            className={cn(buttonClasses)}
          >
            {t('use')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
