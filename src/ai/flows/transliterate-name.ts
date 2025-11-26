'use server';

/**
 * @fileOverview A flow to transliterate a name into a different script.
 *
 * - transliterateName - A function that handles the transliteration process.
 * - TransliterateNameInput - The input type for the transliterateName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransliterateNameInputSchema = z.object({
  name: z.string().describe('The name to be transliterated.'),
  language: z.string().describe('The target language code (e.g., "hi", "or", "en").'),
});
export type TransliterateNameInput = z.infer<typeof TransliterateNameInputSchema>;

const TransliterateNameOutputSchema = z.string().describe('The transliterated name.');
export type TransliterateNameOutput = z.infer<typeof TransliterateNameOutputSchema>;


export async function transliterateName(input: TransliterateNameInput): Promise<TransliterateNameOutput> {
  if (input.language === 'en' || !input.name) {
    return input.name;
  }
  return transliterateNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transliterateNamePrompt',
  input: {schema: TransliterateNameInputSchema},
  output: {format: 'text'},
  prompt: `Transliterate the name '{{{name}}}' into the script for the language '{{{language}}}'.
For example, if the name is 'Ankit' and the language is 'hi', the output should be 'अंकित'.
If the name is 'Sanjay' and the language is 'or', the output should be 'ସଞ୍ଜୟ'.
Return only the transliterated name and nothing else.`,
});

const transliterateNameFlow = ai.defineFlow(
  {
    name: 'transliterateNameFlow',
    inputSchema: TransliterateNameInputSchema,
    outputSchema: TransliterateNameOutputSchema,
  },
  async input => {
    if (input.language === 'en') {
      return input.name;
    }
    const {output} = await prompt(input);
    return output!;
  }
);
