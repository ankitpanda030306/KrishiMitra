'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/translations';
import { Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('settings')}</h1>
        <p className="text-muted-foreground">{t('settingsDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearance')}</CardTitle>
          <CardDescription>{t('appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme">{t('theme')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('themeDescription')}
              </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('light')}>
                    <Sun className="h-[1.2rem] w-[1.2rem]"/>
                    <span className="sr-only">Light</span>
                </Button>
                 <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('dark')}>
                    <Moon className="h-[1.2rem] w-[1.2rem]"/>
                    <span className="sr-only">Dark</span>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('language')}</CardTitle>
          <CardDescription>{t('languageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="max-w-xs">
                 <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language-select">
                        <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">{t('english')}</SelectItem>
                        <SelectItem value="hi">{t('hindi')}</SelectItem>
                        <SelectItem value="or">{t('odia')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
