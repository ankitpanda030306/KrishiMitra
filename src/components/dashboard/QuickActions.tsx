'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scan, Mic } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{t('quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center gap-4 p-6 border rounded-lg bg-card hover:bg-secondary transition-colors">
          <Scan className="w-12 h-12 text-primary" />
          <p className="text-center font-semibold">{t('analyzeImage')}</p>
          <Button onClick={() => router.push('/dashboard/image-analysis')} className="w-full">
            {t('analyzeImage')}
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 p-6 border rounded-lg bg-card hover:bg-secondary transition-colors">
          <Mic className="w-12 h-12 text-primary" />
          <p className="text-center font-semibold">{t('useVoiceInput')}</p>
          <Button className="w-full" variant="outline">
            {t('useVoiceInput')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
