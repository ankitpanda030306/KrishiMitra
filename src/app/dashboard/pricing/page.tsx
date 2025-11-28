
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/lib/user';
import { useLanguage } from '@/lib/i18n';
import { CheckCircle, Gem, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function PricingPage() {
  const { t } = useLanguage();
  const { subscriptionPlan, subscriptionExpires } = useUser();
  const rupeeSymbol = '\u20B9';
  const [isYearly, setIsYearly] = useState(false);

  const isTrial = subscriptionPlan === 'premium' && subscriptionExpires && new Date(subscriptionExpires) > new Date();

  const plans = {
    monthly: {
      name: t('premium'),
      price: '399',
      priceSuffix: t('monthly'),
      description: t('premiumPlanDescription'),
      features: [
        t('unlimitedImageAnalysis'),
        t('unlimitedVoiceAnalysis'),
        t('advancedAdvisories'),
        t('prioritySupport'),
      ],
      isCurrent: subscriptionPlan === 'premium' && !isTrial,
      Icon: Gem,
    },
    yearly: {
      name: t('premium'),
      price: '3999',
      priceSuffix: t('yearly'),
      description: t('premiumPlanDescription'),
       features: [
        t('unlimitedImageAnalysis'),
        t('unlimitedVoiceAnalysis'),
        t('advancedAdvisories'),
        t('prioritySupport'),
      ],
      isCurrent: subscriptionPlan === 'premium' && !isTrial,
      Icon: Gem,
    }
  };

  const currentPlan = isYearly ? plans.yearly : plans.monthly;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">{t('pricing')}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('pricingDescription')}
        </p>
      </div>

       <div className="flex justify-center items-center gap-4">
          <Label htmlFor="billing-cycle">{t('monthly')}</Label>
          <Switch
            id="billing-cycle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-cycle" className="flex items-center">
            {t('yearly')}
            <Badge variant="secondary" className="ml-2 bg-accent/50 border-accent text-accent-foreground">SAVE 15%</Badge>
          </Label>
        </div>
      
      {isTrial && (
        <Card className="max-w-xl mx-auto border-primary ring-2 ring-primary">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <Star className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl">Free Trial Active</CardTitle>
                </div>
                <CardDescription>
                    {`Your premium trial expires on ${new Date(subscriptionExpires!).toLocaleDateString()}.`}
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-lg mx-auto">
          <Card
            key={currentPlan.name}
            className={cn(
              'flex flex-col',
              'border-primary ring-2 ring-primary shadow-lg'
            )}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2">
                <currentPlan.Icon
                  className={cn(
                    'w-8 h-8',
                    'text-primary'
                  )}
                />
                <CardTitle className="text-2xl">{currentPlan.name}</CardTitle>
              </div>
              <CardDescription>{currentPlan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div className="text-center">
                <span className="text-5xl font-bold">
                  {rupeeSymbol}
                  {currentPlan.price}
                </span>
                <span className="text-muted-foreground">/{currentPlan.priceSuffix}</span>
              </div>
              <ul className="space-y-3">
                {currentPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentPlan.isCurrent ? (
                <Button disabled className="w-full" variant="outline">
                  {t('currentPlan')}
                </Button>
              ) : (
                <Button className="w-full">{t('upgradeToPremium')}</Button>
              )}
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}
