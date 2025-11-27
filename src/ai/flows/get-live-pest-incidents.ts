'use server';
/**
 * @fileOverview Generates a list of live pest incidents based on location.
 *
 * - getLivePestIncidents - A function that returns live pest incidents.
 * - GetLivePestIncidentsInput - The input type for the getLivePestIncidents function.
 * - GetLivePestIncidentsOutput - The return type for the getLivePestIncidents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLivePestIncidentsInputSchema = z.object({
  latitude: z.number().describe('Latitude of the location.'),
  longitude: z.number().describe('Longitude of the location.'),
  language: z.string().optional().describe('The language for the response, e.g., "en", "hi", "or".'),
});
export type GetLivePestIncidentsInput = z.infer<typeof GetLivePestIncidentsInputSchema>;

const IncidentSchema = z.object({
  pest: z.string().describe('The common name of the pest (e.g., "Aphids", "Locust Swarm").'),
  location: z.string().describe('A nearby city or region for the incident.'),
  time: z.string().describe('A relative time string for when the incident was reported (e.g., "2 hours ago", "1 day ago").'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).describe('The severity of the pest incident.'),
  description: z.string().describe('A 2-3 line description of the incident, its impact, and recommended immediate actions.'),
});

const GetLivePestIncidentsOutputSchema = z.object({
  incidents: z.array(IncidentSchema).describe('An array of 4-5 recent pest incidents.'),
});

export type GetLivePestIncidentsOutput = z.infer<typeof GetLivePestIncidentsOutputSchema>;


export async function getLivePestIncidents(input: GetLivePestIncidentsInput): Promise<GetLivePestIncidentsOutput> {
  return getLivePestIncidentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getLivePestIncidentsPrompt',
  input: {schema: GetLivePestIncidentsInputSchema},
  output: {schema: GetLivePestIncidentsOutputSchema},
  prompt: `You are an agricultural AI assistant. Based on the provided latitude and longitude, generate a realistic list of 4-5 recent pest incidents that could plausibly occur in that geographical region of India.

  For each incident, provide the pest name, a nearby location (city or district), a relative time of discovery, a severity level, and a 2-3 line description of the incident, its potential impact on crops, and any immediate recommended actions for farmers.
  {{#if language}}The 'pest', 'location', and 'description' fields should be in the specified language: {{{language}}}.{{else}}The response should be in English.{{/if}}

  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}

  Return the data as a JSON object.
  `,
});

const getLivePestIncidentsFlow = ai.defineFlow(
  {
    name: 'getLivePestIncidentsFlow',
    inputSchema: GetLivePestIncidentsInputSchema,
    outputSchema: GetLivePestIncidentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
