
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
import { add } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { TranslationKey } from '@/lib/i18n/translations';

// Define plans statically outside the component to prevent hydration issues
const staticPlans = [
    {
      planNameKey: 'free' as TranslationKey,
      price: '0',
      descriptionKey: 'freePlanDescription' as TranslationKey,
      featuresKeys: [
        'basicImageAnalysis' as TranslationKey,
        'voiceAnalysis' as TranslationKey,
        'marketListings' as TranslationKey,
      ],
      Icon: Star,
      isFeatured: false,
      planId: 'free',
    },
    {
      planNameKey: 'freemium' as TranslationKey,
      price: '399',
      priceSuffixKey: 'monthly' as TranslationKey,
      descriptionKey: 'freemiumPlanDescription' as TranslationKey,
      featuresKeys: [
        'unlimitedImageAnalysis' as TranslationKey,
        'unlimitedVoiceAnalysis' as TranslationKey,
        'advancedAdvisories' as TranslationKey,
        'prioritySupport' as TranslationKey,
      ],
      Icon: Gem,
      isFeatured: true,
      planId: 'premium',
    },
  ];


export default function PricingPage() {
  const { t } = useLanguage();
  const { subscriptionPlan, setUserDetails } = useUser();
  const { toast } = useToast();
  const rupeeSymbol = 'Rs.';

  const handleStartTrial = () => {
    const oneMonthFromNow = add(new Date(), { months: 1 });
    setUserDetails({
      subscriptionPlan: 'premium',
      subscriptionExpires: oneMonthFromNow.toISOString(),
    });
    toast({
        title: 'Free Trial Started!',
        description: 'You now have access to all freemium features for 30 days.'
    })
  };

  const plans = staticPlans.map(p => {
      const isCurrent = subscriptionPlan === p.planId;
      let buttonLabel = '';
      let buttonAction = () => {};
      let buttonDisabled = false;

      if (p.planId === 'free') {
          buttonLabel = t('currentPlan');
          buttonDisabled = true;
      } else if (p.planId === 'premium') {
          buttonLabel = isCurrent ? t('currentPlan') : t('startFreeTrial');
          buttonAction = isCurrent ? () => {} : handleStartTrial;
          buttonDisabled = isCurrent;
      }

      return {
        ...p,
        name: t(p.planNameKey),
        description: t(p.descriptionKey),
        priceSuffix: p.priceSuffixKey ? t(p.priceSuffixKey) : undefined,
        features: p.featuresKeys.map(key => t(key)),
        isCurrent: isCurrent,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'flex flex-col',
              plan.isFeatured && 'border-primary ring-2 ring-primary shadow-lg'
            )}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2">
                <plan.Icon
                  className={cn(
                    'w-8 h-8',
                    plan.isFeatured ? 'text-primary' : 'text-muted-foreground'
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
                disabled={plan.buttonDisabled}
                className="w-full"
                variant={plan.isCurrent ? 'outline' : 'default'}
              >
                {plan.buttonLabel}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center text-muted-foreground">
        <p className="font-bold">{t('yearlyBilling')}: {rupeeSymbol}3999/year (Save 15%)</p>
        <p>{t('contactForYearly')}</p>
      </div>
    </div>
  );
}

    