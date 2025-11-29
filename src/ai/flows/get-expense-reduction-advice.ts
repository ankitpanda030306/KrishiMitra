
'use server';
/**
 * @fileOverview Generates AI-powered advice to reduce farm expenses.
 *
 * - getExpenseReductionAdvice - A function that returns cost-saving advice.
 * - GetExpenseReductionAdviceInput - The input type for the function.
 * - GetExpenseReductionAdviceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpenseDetailSchema = z.object({
  type: z.string().describe("The category of the expense."),
  amount: z.number().describe("The cost of the expense.")
});

const GetExpenseReductionAdviceInputSchema = z.object({
  cropType: z.string().describe('The primary crop for this season.'),
  totalExpenses: z.number().describe('The total expenses incurred so far.'),
  expectedRevenue: z.number().describe('The total expected revenue from this crop season.'),
  expenses: z.array(ExpenseDetailSchema).describe("A list of all expenses with their type and amount."),
  language: z.string().optional().describe('The language for the response, e.g., "en", "hi", "or".'),
});
export type GetExpenseReductionAdviceInput = z.infer<typeof GetExpenseReductionAdviceInputSchema>;

const GetExpenseReductionAdviceOutputSchema = z.object({
    advice: z.string().describe("Actionable advice on how to reduce expenses, presented as a concise bulleted list.")
});

export type GetExpenseReductionAdviceOutput = z.infer<typeof GetExpenseReductionAdviceOutputSchema>;


export async function getExpenseReductionAdvice(input: GetExpenseReductionAdviceInput): Promise<GetExpenseReductionAdviceOutput> {
  return getExpenseReductionAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getExpenseReductionAdvicePrompt',
  input: {schema: GetExpenseReductionAdviceInputSchema},
  output: {schema: GetExpenseReductionAdviceOutputSchema},
  prompt: `You are an expert agricultural financial advisor. Your task is to analyze a farmer's expenses for a crop season and provide actionable, concise advice on how to reduce costs. The profit margin is low or negative.

  Season Details:
  - Crop: {{{cropType}}}
  - Total Expenses: {{{totalExpenses}}}
  - Expected Revenue: {{{expectedRevenue}}}

  Expense Breakdown:
  {{#each expenses}}
  - {{{this.type}}}: {{{this.amount}}}
  {{/each}}

  Based on the expense breakdown, identify the top 2-3 areas where costs can be optimized. Provide a bulleted list of practical suggestions. For example, suggest cheaper alternatives for fertilizers, optimizing labor schedules, or exploring government subsidies for machinery. Keep the advice short and to the point.

  {{#if language}}The entire response for the 'advice' field must be in the specified language: {{{language}}}.{{else}}The response should be in English.{{/if}}

  Return the data as a single JSON object.
  `,
});

const getExpenseReductionAdviceFlow = ai.defineFlow(
  {
    name: 'getExpenseReductionAdviceFlow',
    inputSchema: GetExpenseReductionAdviceInputSchema,
    outputSchema: GetExpenseReductionAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
