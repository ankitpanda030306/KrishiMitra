
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/lib/i18n';
import { Landmark, Bot, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { findGovernmentSchemes, FindGovernmentSchemesOutput } from '@/ai/flows/find-government-schemes';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const schemeFinderSchema = z.object({
  landSize: z.coerce.number().min(0.1, "Land size must be greater than 0."),
  location: z.string().min(2, "Location is required."),
  crops: z.string().min(2, "Please list at least one crop."),
});
type SchemeFinderFormValues = z.infer<typeof schemeFinderSchema>;

export default function SchemeFinderPage() {
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState<FindGovernmentSchemesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SchemeFinderFormValues>({
    resolver: zodResolver(schemeFinderSchema),
    defaultValues: {
      landSize: 2,
      location: 'Maharashtra',
      crops: 'Cotton, Sugarcane',
    },
  });

  const onSubmit = async (data: SchemeFinderFormValues) => {
    setLoading(true);
    setError(null);
    setSchemes(null);
    try {
      const cropArray = data.crops.split(',').map(c => c.trim());
      const result = await findGovernmentSchemes({ ...data, crops: cropArray, language });
      setSchemes(result);
    } catch (e: any) {
      if (e.message && e.message.includes('model is overloaded')) {
        setError(t('aiServiceOverloaded'));
      } else {
        setError("Failed to find schemes. Please try again.");
      }
      console.error("Failed to find schemes:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Landmark className="w-8 h-8 text-primary" />
          {t('schemeFinder')}
        </h1>
        <p className="text-muted-foreground">{t('schemeFinderDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('yourDetails')}</CardTitle>
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('location')}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Maharashtra" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="crops"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mainCrops')}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cotton, Sugarcane" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('findSchemes')}
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
                {t('eligibleSchemes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-muted-foreground">{t('findingSchemes')}</p>
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center text-center text-destructive gap-4 py-16">
                  <AlertTriangle className="w-12 h-12" />
                  <p className="font-semibold">{t('error')}</p>
                  <p>{error}</p>
                </div>
              )}
              {!loading && !schemes && (
                 <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                  <Landmark className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground max-w-sm">{t('fillDetailsToFindSchemes')}</p>
                </div>
              )}
              {schemes && (
                <div className="space-y-6">
                  {schemes.schemes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t('noSchemesFound')}</p>
                  ) : (
                    schemes.schemes.map((scheme, index) => (
                      <Card key={index} className="bg-card">
                        <CardHeader>
                            <CardTitle>{scheme.name}</CardTitle>
                            <CardDescription>{scheme.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-1">{t('eligibility')}</h4>
                                <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                           <Button asChild variant="outline">
                             <Link href={scheme.applicationLink} target="_blank" rel="noopener noreferrer">
                                {t('applyNow')} <ExternalLink className="ml-2 h-4 w-4" />
                             </Link>
                           </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
