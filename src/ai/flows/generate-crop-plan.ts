'use server';
/**
 * @fileOverview Generates a personalized crop plan based on farm-specific details.
 *
 * - generateCropPlan - A function that returns a detailed crop plan.
 * - GenerateCropPlanInput - The input type for the generateCropPlan function.
 * - GenerateCropPlanOutput - The return type for the generateCropPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCropPlanInputSchema = z.object({
  landSize: z.number().describe('The size of the land in acres.'),
  soilType: z.string().describe('The type of soil (e.g., "Loamy", "Clay", "Sandy").'),
  waterAvailability: z.string().describe('The availability of water (e.g., "Abundant", "Moderate", "Scarce").'),
  language: z.string().optional().describe('The language for the response, e.g., "en", "hi", "or".'),
});
export type GenerateCropPlanInput = z.infer<typeof GenerateCropPlanInputSchema>;

const GenerateCropPlanOutputSchema = z.object({
    cropRecommendations: z.array(z.object({
        cropName: z.string().describe("The name of the recommended crop."),
        sowingDate: z.string().describe("The optimal sowing date or period for the crop."),
        reasoning: z.string().describe("A brief reason why this crop is recommended.")
    })).describe("A list of recommended crops and their sowing dates."),
    fertilizerSchedule: z.array(z.object({
        stage: z.string().describe("The growth stage of the crop (e.g., 'Pre-sowing', 'Vegetative', 'Flowering')."),
        fertilizer: z.string().describe("The recommended fertilizer or nutrient mix (e.g., 'Urea: 50kg/acre')."),
        notes: z.string().describe("Additional notes or instructions for this stage.")
    })).describe("A schedule for fertilizer application with quantities."),
    irrigationSchedule: z.array(z.object({
        week: z.string().describe("The week of the cycle (e.g., 'Week 1-2', 'Week 3-4')."),
        frequency: z.string().describe("How often to irrigate (e.g., 'Twice a week')."),
        notes: z.string().describe("Additional notes or weather considerations for irrigation.")
    })).describe("A weekly schedule for irrigation."),
    financialAnalysis: z.object({
        expectedCost: z.string().describe("The estimated total cost for the entire plan, formatted as a currency string (e.g., 'Rs. 50,000')."),
        expectedProfit: z.string().describe("The estimated potential profit, formatted as a currency string (e.g., 'Rs. 1,20,000')."),
        riskAnalysis: z.string().describe("A brief analysis of potential risks and mitigation strategies.")
    }).describe("A financial breakdown of the crop plan.")
});

export type GenerateCropPlanOutput = z.infer<typeof GenerateCropPlanOutputSchema>;


export async function generateCropPlan(input: GenerateCropPlanInput): Promise<GenerateCropPlanOutput> {
  return generateCropPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCropPlanPrompt',
  input: {schema: GenerateCropPlanInputSchema},
  output: {schema: GenerateCropPlanOutputSchema},
  prompt: `You are an expert agricultural AI planner. Your task is to create a comprehensive and personalized crop plan based on the farmer's specific inputs and local weather patterns for a region in India.

  Farmer's Details:
  - Land Size: {{{landSize}}} acres
  - Soil Type: {{{soilType}}}
  - Water Availability: {{{waterAvailability}}}

  Based on these details, please provide the following:
  1.  **Crop Recommendations**: Suggest an optimal combination of 1-2 crops suitable for Indian conditions. For each, provide the best sowing date and a reason.
  2.  **Fertilizer Schedule**: Create a schedule for fertilizer application, broken down by growth stage. Include specific quantities (e.g., 'Urea: 50kg/acre').
  3.  **Irrigation Schedule**: Provide a simple weekly irrigation schedule for the crop cycle.
  4.  **Financial Analysis**: Provide an estimated cost, expected profit, and a brief risk analysis.

  {{#if language}}The entire response for all fields must be in the specified language: {{{language}}}.{{else}}The response should be in English.{{/if}}

  Return the data as a single JSON object.
  `,
});

const generateCropPlanFlow = ai.defineFlow(
  {
    name: 'generateCropPlanFlow',
    inputSchema: GenerateCropPlanInputSchema,
    outputSchema: GenerateCropPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
