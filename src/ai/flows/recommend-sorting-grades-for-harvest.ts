'use server';
/**
 * @fileOverview Recommends sorting grades for a harvest based on quality.
 *
 * - recommendSortingGradesForHarvest - A function that handles the recommendation of sorting grades for a harvest.
 * - RecommendSortingGradesForHarvestInput - The input type for the recommendSortingGradesForHarvest function.
 * - RecommendSortingGradesForHarvestOutput - The return type for the recommendSortingGradesForHarvest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSortingGradesForHarvestInputSchema = z.object({
  cropType: z.string().describe('The type of crop being harvested.'),
  qualityDescription: z
    .string()
    .describe(
      'A detailed description of the harvested crop quality, including any defects, diseases, or signs of decay.'
    ),
  harvestPhotoDataUri: z
    .string()
    .describe(
      "A photo of the harvested crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the response, e.g., "en", "hi", "or".'),
});
export type RecommendSortingGradesForHarvestInput = z.infer<
  typeof RecommendSortingGradesForHarvestInputSchema
>;

const RecommendSortingGradesForHarvestOutputSchema = z.object({
  sortingRecommendations: z.array(
    z.object({
      grade: z.string().describe('The recommended grade for this portion of the harvest (e.g., premium, market-ready, discard/process).'),
      reasoning: z.string().describe('The reasoning behind the grade recommendation, based on the provided quality description and crop type.'),
    })
  ).describe('An array of sorting recommendations for the harvest.')
});
export type RecommendSortingGradesForHarvestOutput = z.infer<
  typeof RecommendSortingGradesForHarvestOutputSchema
>;

export async function recommendSortingGradesForHarvest(
  input: RecommendSortingGradesForHarvestInput
): Promise<RecommendSortingGradesForHarvestOutput> {
  return recommendSortingGradesForHarvestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSortingGradesForHarvestPrompt',
  input: {schema: RecommendSortingGradesForHarvestInputSchema},
  output: {schema: RecommendSortingGradesForHarvestOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in harvest sorting and grading.

  Based on the description of the crop quality, and the provided image, recommend how to sort the harvest into different grades to maximize profit.
  Consider the type of crop, quality, defects and signs of decay when determining the grade. Provide clear reasoning for each recommendation.
  {{#if language}}The response for 'grade' and 'reasoning' fields must be in the specified language: {{{language}}}.{{else}}The response should be in English.{{/if}}

  Crop Type: {{{cropType}}}
  Quality Description: {{{qualityDescription}}}
  Harvest Photo: {{media url=harvestPhotoDataUri}}

  Return the recommendations in JSON format.
  `,
});

const recommendSortingGradesForHarvestFlow = ai.defineFlow(
  {
    name: 'recommendSortingGradesForHarvestFlow',
    inputSchema: RecommendSortingGradesForHarvestInputSchema,
    outputSchema: RecommendSortingGradesForHarvestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
