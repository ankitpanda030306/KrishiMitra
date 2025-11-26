
'use client';

import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/lib/user';

export default function WelcomeHeader() {
  const { t } = useLanguage();
  const { name } = useUser();
  const farmerName = name || t('farmer');

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-foreground">
        {t('welcomeBack')} {farmerName}
      </h1>
      <p className="text-muted-foreground">{t('heresYourDailyBriefing')}</p>
    </div>
  );
}


    