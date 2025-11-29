
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
import { CheckCircle, Star, Rocket, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { TranslationKey } from '@/lib/i18n/translations';
import { useState } from 'react';

// Define plans statically outside the component to prevent hydration issues
const staticPlans = [
    {
      planNameKey: 'free' as TranslationKey,
      price: '0',
      descriptionKey: 'freePlanDescription' as TranslationKey,
      featuresKeys: [
        'unlimitedImageAnalysis' as TranslationKey,
        'unlimitedVoiceAnalysis' as TranslationKey,
        'marketListings' as TranslationKey,
      ],
      Icon: Star,
      isFeatured: false,
      planId: 'free',
    },
    {
      planNameKey: 'premium' as TranslationKey,
      price: '599',
      priceSuffixKey: 'monthly' as TranslationKey,
      descriptionKey: 'premiumPlanDescription' as TranslationKey,
      featuresKeys: [
        'unlimitedImageAnalysis' as TranslationKey,
        'unlimitedVoiceAnalysis' as TranslationKey,
        'advancedAdvisories' as TranslationKey,
        'prioritySupport' as TranslationKey,
        'droneFacility' as TranslationKey,
      ],
      Icon: Rocket,
      isFeatured: true,
      planId: 'premium',
    }
  ];


export default function PricingPage() {
  const { t } = useLanguage();
  const { subscriptionPlan } = useUser();
  const { toast } = useToast();
  const rupeeSymbol = 'Rs.';
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  
  const handleUpgradeToPremium = () => {
    toast({
        title: 'Feature Not Available',
        description: 'This feature will be available very soon. Sorry for the inconvenience.',
    });
  };

  const plans = staticPlans.map(p => {
      const isCurrent = subscriptionPlan === p.planId;
      let buttonLabel = '';
      let buttonAction = () => {};
      let buttonDisabled = false;
      const isLoading = loadingPlanId === p.planId;

      if (p.planId === 'free') {
          buttonLabel = isCurrent ? t('currentPlan') : 'Downgrade';
          buttonDisabled = isCurrent || subscriptionPlan !== 'free';
      } else if (p.planId === 'premium') {
          buttonLabel = isCurrent ? t('currentPlan') : t('upgradeToPremium');
          buttonAction = isCurrent ? () => {} : handleUpgradeToPremium;
          buttonDisabled = isCurrent || !!loadingPlanId;
      }

      return {
        ...p,
        name: t(p.planNameKey),
        description: t(p.descriptionKey),
        priceSuffix: p.priceSuffixKey ? t(p.priceSuffixKey) : undefined,
        features: p.featuresKeys.map(key => t(key)),
        isCurrent: isCurrent,
        isLoading,
        buttonLabel,
        buttonAction,
        buttonDisabled,
      }
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">{t('pricing')}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('pricingDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'flex flex-col',
              plan.isFeatured && 'theme-premium border-2 border-amber-500'
            )}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2">
                <plan.Icon
                  className={cn(
                    'w-8 h-8',
                    plan.isFeatured ? 'text-amber-500' : 'text-muted-foreground'
                  )}
                />
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div className="text-center">
                <span className="text-5xl font-bold">
                  {rupeeSymbol}
                  {plan.price}
                </span>
                {plan.priceSuffix && <span className="text-muted-foreground">/{plan.priceSuffix}</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={plan.buttonAction}
                disabled={plan.buttonDisabled || plan.isLoading}
                className={cn("w-full", plan.isFeatured && 'bg-amber-500 hover:bg-amber-600 text-black')}
                variant={plan.isCurrent ? 'outline' : 'default'}
              >
                {plan.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {plan.buttonLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center text-muted-foreground space-y-1">
        <p className="font-bold">{t('yearlyBilling')}</p>
        <p>{rupeeSymbol}4499/{t('yearly')} for Premium (Save ~25%)</p>
        <p>{t('contactForYearly')}</p>
      </div>
    </div>
  );
}
