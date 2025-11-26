'use server';

/**
 * @fileOverview Analyzes a crop image for defects and diseases.
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
});
export type AnalyzeCropImageForDefectsInput = z.infer<typeof AnalyzeCropImageForDefectsInputSchema>;

const AnalyzeCropImageForDefectsOutputSchema = z.object({
  defects: z.array(
    z.string().describe('A list of potential defects or diseases identified in the crop.')
  ).describe('List of defects found'),
  confidenceScores: z.array(
    z.number().describe('The confidence score for each defect identified.')
  ).describe('Confidence scores for defects'),
});
export type AnalyzeCropImageForDefectsOutput = z.infer<typeof AnalyzeCropImageForDefectsOutputSchema>;

export async function analyzeCropImageForDefects(input: AnalyzeCropImageForDefectsInput): Promise<AnalyzeCropImageForDefectsOutput> {
  return analyzeCropImageForDefectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCropImageForDefectsPrompt',
  input: {schema: AnalyzeCropImageForDefectsInputSchema},
  output: {schema: AnalyzeCropImageForDefectsOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing crop images for defects and diseases.

  Analyze the image and identify any potential defects or diseases present in the crop.
  Provide a list of defects identified and their corresponding confidence scores.

  Image: {{media url=photoDataUri}}
  Format your response as a JSON object with 'defects' and 'confidenceScores' fields.
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
