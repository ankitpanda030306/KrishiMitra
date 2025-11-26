
'use client';

import { useLanguage } from '@/lib/i18n';
import { useUser } from '@/lib/user';

export default function WelcomeHeader() {
  const { t } = useLanguage();
  const { displayName } = useUser();

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline text-foreground">
        {t('welcomeBack')} {displayName}
      </h1>
      <p className="text-muted-foreground">{t('heresYourDailyBriefing')}</p>
    </div>
  );
}


    
