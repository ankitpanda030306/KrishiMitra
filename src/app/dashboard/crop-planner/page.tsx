"use client";

import { useState } from 'react';
import { useForm, zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n';
import { Tractor, Bot, Loader2, AlertTriangle, ChevronsRight, Calendar, Droplets, LineChart, Shield, IndianRupee } from 'lucide-react';
import { generateCropPlan, GenerateCropPlanOutput } from '@/ai/flows/generate-crop-plan';
import { Separator } from '@/components/ui/separator';

const cropPlannerSchema = z.object({
  landSize: z.coerce.number().min(0.1, "Land size must be greater than 0."),
  soilType: z.string().min(1, "Soil type is required."),
  waterAvailability: z.string().min(1, "Water availability is required."),
});
type CropPlannerFormValues = z.infer<typeof cropPlannerSchema>;

export default function CropPlannerPage() {
  const { t, language } = useLanguage();
  const [plan, setPlan] = useState<GenerateCropPlanOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CropPlannerFormValues>({
    resolver: zodResolver(cropPlannerSchema),
    defaultValues: {
      landSize: 1,
      soilType: '',
      waterAvailability: '',
    },
  });

  const onSubmit = async (data: CropPlannerFormValues) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateCropPlan({ ...data, language });
      setPlan(result);
    } catch (e: any) {
      if (e.message && e.message.includes('model is overloaded')) {
        setError(t('aiServiceOverloaded'));
      } else {
        setError("Failed to generate a crop plan. Please try again.");
      }
      console.error("Failed to generate crop plan:", e);
    } finally {
      setLoading(false);
    }
  };

  const soilTypes = ["Alluvial", "Black (Cotton)", "Red and Yellow", "Laterite", "Arid", "Saline", "Peaty", "Forest"];
  const waterLevels = ["Abundant (Canal/Borewell)", "Moderate (Monsoon Dependant)", "Scarce (Rain-fed)"];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Tractor className="w-8 h-8 text-primary" />
          {t('aiCropPlanner')}
        </h1>
        <p className="text-muted-foreground">{t('aiCropPlannerDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('farmDetails')}</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="landSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('landSizeAcres')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soilType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('soilType')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectSoilType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {soilTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waterAvailability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('waterAvailability')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectWaterAvailability')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {waterLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('generatePlan')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="lg:col-span-2">
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary" />
                {t('yourPersonalisedPlan')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-muted-foreground">{t('generatingPlan')}</p>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center text-center text-destructive gap-4 py-16">
                  <AlertTriangle className="w-12 h-12" />
                  <p className="font-semibold">{t('error')}</p>
                  <p>{error}</p>
                </div>
              )}
              {!loading && !plan && (
                 <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                  <Tractor className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground max-w-sm">{t('fillDetailsToGenerate')}</p>
                </div>
              )}
              {plan && (
                <div className="space-y-6">
                  {/* Crop Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('cropRecommendations')}</h3>
                    <div className="space-y-4">
                      {plan.cropRecommendations.map((rec, index) => (
                        <Card key={index} className="bg-secondary/20">
                          <CardHeader className="p-4">
                            <CardTitle className="text-xl">{rec.cropName}</CardTitle>
                            <CardDescription className="flex items-center gap-2"><Calendar className="w-4 h-4"/> {rec.sowingDate}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Fertilizer Schedule */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('fertilizerSchedule')}</h3>
                    <div className="space-y-3">
                      {plan.fertilizerSchedule.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                            <Droplets className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{item.stage}: <span className="font-normal">{item.fertilizer}</span></p>
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Financial Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('financialAnalysis')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('expectedCost')}</CardTitle>
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{plan.financialAnalysis.expectedCost}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{t('expectedProfit')}</CardTitle>
                          <LineChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">{plan.financialAnalysis.expectedProfit}</div>
                        </CardContent>
                      </Card>
                      <Card className="md:col-span-2">
                         <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          <CardTitle className="text-sm font-medium">{t('riskAnalysis')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{plan.financialAnalysis.riskAnalysis}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
