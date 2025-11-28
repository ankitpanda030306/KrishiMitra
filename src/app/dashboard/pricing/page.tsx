
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

export default function PricingPage() {
  const { t } = useLanguage();
  const { subscriptionPlan, setUserDetails } = useUser();
  const { toast } = useToast();
  const rupeeSymbol = '\u20B9';

  const handleStartTrial = () => {
    const oneMonthFromNow = add(new Date(), { months: 1 });
    setUserDetails({
      subscriptionPlan: 'freemium',
      subscriptionExpires: oneMonthFromNow.toISOString(),
    });
    toast({
        title: 'Free Trial Started!',
        description: 'You now have access to all freemium features for 30 days.'
    })
  };

  const plans = [
    {
      name: t('free'),
      price: '0',
      description: t('freePlanDescription'),
      features: [
        t('basicImageAnalysis'),
        t('voiceAnalysis'),
        t('marketListings'),
      ],
      isCurrent: subscriptionPlan === 'free',
      buttonLabel: t('currentPlan'),
      buttonAction: () => {},
      buttonDisabled: true,
      Icon: Star,
      isFeatured: false,
    },
    {
      name: t('freemium'),
      price: '399',
      priceSuffix: t('monthly'),
      description: t('freemiumPlanDescription'),
      features: [
        t('unlimitedImageAnalysis'),
        t('unlimitedVoiceAnalysis'),
        t('advancedAdvisories'),
        t('prioritySupport'),
      ],
      isCurrent: subscriptionPlan === 'freemium',
      buttonLabel: t('startFreeTrial'),
      buttonAction: handleStartTrial,
      buttonDisabled: subscriptionPlan === 'freemium',
      Icon: Gem,
      isFeatured: true,
    },
  ];

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
