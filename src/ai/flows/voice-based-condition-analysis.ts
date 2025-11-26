'use server';

/**
 * @fileOverview Analyzes crop conditions described via voice and provides recommendations.
 *
 * - analyzeVoiceCondition - A function that handles the analysis of crop conditions described via voice.
 * - VoiceConditionInput - The input type for the analyzeVoiceCondition function.
 * - VoiceConditionOutput - The return type for the analyzeVoiceCondition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceConditionInputSchema = z.object({
  voiceDescription: z
    .string()
    .describe('A description of the crop conditions provided via voice.'),
  location: z
    .string()
    .optional()
    .describe('The GPS coordinates of the farm location, e.g., "37.7749,-122.4194"'),
});
export type VoiceConditionInput = z.infer<typeof VoiceConditionInputSchema>;

const VoiceConditionOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('AI-powered recommendations based on the described crop conditions.'),
});
export type VoiceConditionOutput = z.infer<typeof VoiceConditionOutputSchema>;

export async function analyzeVoiceCondition(input: VoiceConditionInput): Promise<VoiceConditionOutput> {
  return analyzeVoiceConditionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceConditionAnalysisPrompt',
  input: {schema: VoiceConditionInputSchema},
  output: {schema: VoiceConditionOutputSchema},
  prompt: `You are an AI assistant providing recommendations to farmers based on their descriptions of crop conditions.

  Description: {{{voiceDescription}}}

  {% if location %}Location: {{{location}}}{% endif %}

  Provide specific and actionable recommendations to address the described conditions. Focus on potential issues, preventative measures, and treatment options.
  Ensure the recommendations are clear, concise, and easy to understand for farmers.
  If a location is provided, tailor your recommendations to the local climate and growing conditions.
  `,
});

const analyzeVoiceConditionFlow = ai.defineFlow(
  {
    name: 'analyzeVoiceConditionFlow',
    inputSchema: VoiceConditionInputSchema,
    outputSchema: VoiceConditionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
