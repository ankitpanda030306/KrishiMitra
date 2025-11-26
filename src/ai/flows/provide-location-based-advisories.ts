'use server';
/**
 * @fileOverview Provides location-based advisories on irrigation, spray timings, and planting/harvesting windows.
 *
 * - provideLocationBasedAdvisories - A function that returns location-based advisories.
 * - ProvideLocationBasedAdvisoriesInput - The input type for the provideLocationBasedAdvisories function.
 * - ProvideLocationBasedAdvisoriesOutput - The return type for the provideLocationBasedAdvisories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideLocationBasedAdvisoriesInputSchema = z.object({
  latitude: z.number().describe('Latitude of the location.'),
  longitude: z.number().describe('Longitude of the location.'),
});
export type ProvideLocationBasedAdvisoriesInput = z.infer<typeof ProvideLocationBasedAdvisoriesInputSchema>;

const ProvideLocationBasedAdvisoriesOutputSchema = z.object({
  irrigationAdvisory: z.string().describe('Advisory on irrigation.'),
  sprayTimingAdvisory: z.string().describe('Advisory on spray timings.'),
  plantingHarvestingAdvisory: z.string().describe('Advisory on planting and harvesting windows.'),
});
export type ProvideLocationBasedAdvisoriesOutput = z.infer<typeof ProvideLocationBasedAdvisoriesOutputSchema>;

export async function provideLocationBasedAdvisories(input: ProvideLocationBasedAdvisoriesInput): Promise<ProvideLocationBasedAdvisoriesOutput> {
  return provideLocationBasedAdvisoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideLocationBasedAdvisoriesPrompt',
  input: {schema: ProvideLocationBasedAdvisoriesInputSchema},
  output: {schema: ProvideLocationBasedAdvisoriesOutputSchema},
  prompt: `You are an AI assistant providing farming advisories based on location.

  Provide specific advisories for irrigation, spray timings, and planting/harvesting windows based on the provided location.

  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}
  `,
});

const provideLocationBasedAdvisoriesFlow = ai.defineFlow(
  {
    name: 'provideLocationBasedAdvisoriesFlow',
    inputSchema: ProvideLocationBasedAdvisoriesInputSchema,
    outputSchema: ProvideLocationBasedAdvisoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
