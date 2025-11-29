
'use server';

/**
 * @fileOverview Analyzes a crop image to identify the crop and check for defects and diseases.
 *
 * - analyzeCropImageForDefects - A function that handles the image analysis process.
 * - AnalyzeCropImageForDefectsInput - The input type for the analyzeCropImageForDefects function.
 * - AnalyzeCropImageForDefectsOutput - The return type for the analyzeCropImageForDefects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCropImageForDefectsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language for the response, e.g., "en", "hi", "or".'),
});
export type AnalyzeCropImageForDefectsInput = z.infer<typeof AnalyzeCropImageForDefectsInputSchema>;

const AnalyzeCropImageForDefectsOutputSchema = z.object({
  cropType: z.string().describe('The type of crop or animal identified in the image (e.g., Tomato, Potato, Cow).'),
  defects: z.array(
    z.string().describe('A list of potential defects or diseases identified in the crop.')
  ).describe('List of defects found'),
  confidenceScores: z.array(
    z.number().describe('The confidence score for each defect identified.')
  ).describe('Confidence scores for defects'),
  estimatedYield: z.string().describe("The estimated yield for the crop in the image, formatted as a string (e.g., '10-12 tons/acre' or '25-30 kg/plant')."),
});
export type AnalyzeCropImageForDefectsOutput = z.infer<typeof AnalyzeCropImageForDefectsOutputSchema>;

export async function analyzeCropImageForDefects(input: AnalyzeCropImageForDefectsInput): Promise<AnalyzeCropImageForDefectsOutput> {
  return analyzeCropImageForDefectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCropImageForDefectsPrompt',
  input: {schema: AnalyzeCropImageForDefectsInputSchema},
  output: {schema: AnalyzeCropImageForDefectsOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing images of crops for health assessment and yield estimation.

  1.  First, identify the plant in the image. This is the 'cropType'.
  2.  Then, analyze the identified subject and identify any potential defects, diseases, or health issues. Provide a list of defects and their corresponding confidence scores.
  3.  Finally, estimate the potential yield for this crop based on its appearance in the image (e.g., density, health, fruit/grain visibility). Provide this as a string like '10-12 tons/acre' or '25-30 kg/plant'.

  {{#if language}}The response for 'cropType', 'defects', and 'estimatedYield' fields must be in the specified language: {{{language}}}.{{else}}The response should be in English.{{/if}}

  Image: {{media url=photoDataUri}}
  Format your response as a JSON object with 'cropType', 'defects', 'confidenceScores', and 'estimatedYield' fields.
  If no defects are found, return an empty array for 'defects' and 'confidenceScores'.
  `,
});

const analyzeCropImageForDefectsFlow = ai.defineFlow(
  {
    name: 'analyzeCropImageForDefectsFlow',
    inputSchema: AnalyzeCropImageForDefectsInputSchema,
    outputSchema: AnalyzeCropImageForDefectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
