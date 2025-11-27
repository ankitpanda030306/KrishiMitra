
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n';
import type { Language } from '@/lib/i18n/translations';
import { User, Lock, Mail, Phone, Home } from 'lucide-react';
import { useUser } from '@/lib/user';

export function AuthForm() {
  const { language, setLanguage, t } = useLanguage();
  const { setUserDetails } = useUser();
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const router = useRouter();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  const handleAuthAction = (action: 'login' | 'signup') => {
    if (action === 'signup') {
      setUserDetails({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        address: signupAddress,
      });
    }
    // For login, the user data is loaded from localStorage by the UserProvider
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold font-headline">{t('createAccount')}</h2>
        <p className="text-muted-foreground">{t('getStarted')}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language">{t('selectLanguage')}</Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language" className="w-full">
              <SelectValue placeholder={t('selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('english')}</SelectItem>
              <SelectItem value="hi">{t('hindi')}</SelectItem>
              <SelectItem value="or">{t('odia')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="signup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">{t('createAccount')}</TabsTrigger>
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
        </TabsList>
        <TabsContent value="signup" className="space-y-4 pt-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="name-signup" placeholder={t('name')} className="pl-9" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email-signup" type="email" placeholder={t('email')} className="pl-9" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password-signup" type="password" placeholder={t('password')} className="pl-9" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="phone-signup" type="tel" placeholder={t('phone')} className="pl-9" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)}/>
          </div>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="address-signup" placeholder={t('address')} className="pl-9" value={signupAddress} onChange={(e) => setSignupAddress(e.target.value)} />
          </div>
          <Button onClick={() => handleAuthAction('signup')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('createAccount')}
          </Button>
        </TabsContent>
        <TabsContent value="login" className="space-y-4 pt-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email-login" type="email" placeholder={t('email')} className="pl-9" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password-login" type="password" placeholder={t('password')} className="pl-9" />
          </div>
          <Button onClick={() => handleAuthAction('login')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('login')}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
