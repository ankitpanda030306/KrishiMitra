'use server';
/**
 * @fileOverview A flow to get realistic, real-time market rates for crops.
 *
 * - getMarketRates - A function that returns market rates.
 * - GetMarketRatesInput - The input type for the getMarketRates function.
 * - GetMarketRatesOutput - The return type for the getMarketRates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMarketRatesInputSchema = z.object({
  crops: z.array(z.string()).describe('An array of crop names.'),
  language: z.string().optional().describe('The language for the crop names in the response, e.g., "en", "hi", "or".'),
});
export type GetMarketRatesInput = z.infer<typeof GetMarketRatesInputSchema>;

const MarketRateSchema = z.object({
  crop: z.string().describe('The name of the crop.'),
  premium: z.string().describe("The plausible real-time price for premium grade produce, formatted as a string like '30-35/kg' or '400-600/dozen'."),
  market: z.string().describe("The plausible real-time price for market-ready grade produce, formatted as a string like '20-25/kg' or '250-350/dozen'."),
});

const GetMarketRatesOutputSchema = z.object({
  rates: z.array(MarketRateSchema).describe('An array of market rates for the requested crops.'),
});
export type GetMarketRatesOutput = z.infer<typeof GetMarketRatesOutputSchema>;


export async function getMarketRates(input: GetMarketRatesInput): Promise<GetMarketRatesOutput> {
  return getMarketRatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMarketRatesPrompt',
  input: {schema: GetMarketRatesInputSchema},
  output: {schema: GetMarketRatesOutputSchema},
  prompt: `You are an agricultural market data provider. Based on the current date, generate plausible real-time market rates for the following list of crops in India.

  Crops:
  {{#each crops}}
  - {{{this}}}
  {{/each}}

  For each crop, provide a price range for 'premium' and 'market' grades. The format should be a string, like "30-35/kg" or "400-600/dozen".
  
  {{#if language}}The 'crop' field in your response should be in the specified language: {{{language}}}.{{else}}The response should be in English.{{/if}}

  Return the data as a JSON object.
  `,
});

const getMarketRatesFlow = ai.defineFlow(
  {
    name: 'getMarketRatesFlow',
    inputSchema: GetMarketRatesInputSchema,
    outputSchema: GetMarketRatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
