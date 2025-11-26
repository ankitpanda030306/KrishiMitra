'use server';

/**
 * @fileOverview A flow to suggest storage instructions based on identified quality and weather conditions.
 *
 * - suggestStorageInstructions - A function that handles the storage instruction process.
 * - SuggestStorageInstructionsInput - The input type for the suggestStorageInstructions function.
 * - SuggestStorageInstructionsOutput - The return type for the suggestStorageInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStorageInstructionsInputSchema = z.object({
  quality: z.string().describe('The identified quality of the harvest (e.g., premium, market-ready, discard/process).'),
  weatherConditions: z.string().describe('The current weather conditions (e.g., temperature, humidity, rain).'),
  location: z.string().describe('The GPS location of the farm.'),
});
export type SuggestStorageInstructionsInput = z.infer<typeof SuggestStorageInstructionsInputSchema>;

const SuggestStorageInstructionsOutputSchema = z.object({
  storageInstructions: z.string().describe('Simple storage instructions based on the quality and weather conditions.'),
});
export type SuggestStorageInstructionsOutput = z.infer<typeof SuggestStorageInstructionsOutputSchema>;

export async function suggestStorageInstructions(input: SuggestStorageInstructionsInput): Promise<SuggestStorageInstructionsOutput> {
  return suggestStorageInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStorageInstructionsPrompt',
  input: {schema: SuggestStorageInstructionsInputSchema},
  output: {schema: SuggestStorageInstructionsOutputSchema},
  prompt: `You are an expert in agricultural storage practices.

  Based on the identified quality of the harvest, current weather conditions, and the farm's location, provide simple and practical storage instructions to preserve the quality of the harvest.

  Quality: {{{quality}}}
  Weather Conditions: {{{weatherConditions}}}
  Location: {{{location}}}
  
  Provide storage instructions that are easy to understand and implement for a farmer.
  `,
});

const suggestStorageInstructionsFlow = ai.defineFlow(
  {
    name: 'suggestStorageInstructionsFlow',
    inputSchema: SuggestStorageInstructionsInputSchema,
    outputSchema: SuggestStorageInstructionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
