'use server';
/**
 * @fileOverview A flow to find relevant government schemes for farmers.
 *
 * - findGovernmentSchemes - A function that returns a list of schemes.
 * - FindGovernmentSchemesInput - The input type for the findGovernmentSchemes function.
 * - FindGovernmentSchemesOutput - The return type for the findGovernmentSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindGovernmentSchemesInputSchema = z.object({
  landSize: z.number().describe('The size of the land in acres.'),
  location: z.string().describe('The state or district of the farm (e.g., "Maharashtra", "Pune").'),
  crops: z.array(z.string()).describe('A list of crops the farmer grows.'),
  language: z.string().optional().describe('The language for the response, e.g., "en", "hi", "or".'),
});
export type FindGovernmentSchemesInput = z.infer<typeof FindGovernmentSchemesInputSchema>;

const SchemeSchema = z.object({
    name: z.string().describe("The official name of the government scheme."),
    description: z.string().describe("A brief, 2-3 sentence description of the scheme's purpose and benefits."),
    eligibility: z.string().describe("A summary of the key eligibility criteria for a farmer to qualify."),
    applicationLink: z.string().url().describe("The direct URL to the scheme's official application page or portal.")
});

const FindGovernmentSchemesOutputSchema = z.object({
  schemes: z.array(SchemeSchema).describe('An array of 3-4 relevant government schemes.'),
});
export type FindGovernmentSchemesOutput = z.infer<typeof FindGovernmentSchemesOutputSchema>;

export async function findGovernmentSchemes(input: FindGovernmentSchemesInput): Promise<FindGovernmentSchemesOutput> {
  return findGovernmentSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findGovernmentSchemesPrompt',
  input: {schema: FindGovernmentSchemesInputSchema},
  output: {schema: FindGovernmentSchemesOutputSchema},
  prompt: `You are an expert AI assistant specializing in Indian agricultural government schemes. Your task is to identify the most relevant schemes for a farmer based on their profile.

  Farmer's Profile:
  - Land Size: {{{landSize}}} acres
  - Location: {{{location}}}
  - Main Crops: {{#each crops}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Based on this profile, please provide a list of 3-4 highly relevant central or state-level government schemes. For each scheme, provide:
  1.  The official name of the scheme.
  2.  A brief, 2-3 sentence description.
  3.  A summary of the key eligibility criteria.
  4.  A direct, valid URL to the application portal or official page.

  {{#if language}}The 'name', 'description', and 'eligibility' fields must be in the specified language: {{{language}}}.{{else}}The response should be in English.{{/if}}

  Return the data as a single JSON object.
  `,
});

const findGovernmentSchemesFlow = ai.defineFlow(
  {
    name: 'findGovernmentSchemesFlow',
    inputSchema: FindGovernmentSchemesInputSchema,
    outputSchema: FindGovernmentSchemesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
