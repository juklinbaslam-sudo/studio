'use server';
/**
 * @fileOverview Translates Indonesian text to natural, conversational Korean using the Gemini API.
 *
 * - translateIndonesianToKorean - A function that handles the translation process.
 * - TranslateIndonesianToKoreanInput - The input type for the translateIndonesianToKorean function.
 * - TranslateIndonesianToKoreanOutput - The return type for the translateIndonesianToKorean function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateIndonesianToKoreanInputSchema = z.object({
  indonesianText: z
    .string()
    .describe('The Indonesian text to translate into Korean.'),
});
export type TranslateIndonesianToKoreanInput = z.infer<
  typeof TranslateIndonesianToKoreanInputSchema
>;

const TranslateIndonesianToKoreanOutputSchema = z.object({
  koreanText: z.string().describe('The translated Korean text (Hangul).'),
  romanization: z
    .string()
    .describe('The romanization of the translated Korean text.'),
});
export type TranslateIndonesianToKoreanOutput = z.infer<
  typeof TranslateIndonesianToKoreanOutputSchema
>;

export async function translateIndonesianToKorean(
  input: TranslateIndonesianToKoreanInput
): Promise<TranslateIndonesianToKoreanOutput> {
  return translateIndonesianToKoreanFlow(input);
}

const translateIndonesianToKoreanPrompt = ai.definePrompt({
  name: 'translateIndonesianToKoreanPrompt',
  input: {schema: TranslateIndonesianToKoreanInputSchema},
  output: {schema: TranslateIndonesianToKoreanOutputSchema},
  prompt: `You are a native South Korean translator. Translate the user's Indonesian text into natural, daily conversational Korean (banmal/polite informal), similar to the dialogue found in K-Dramas and movies. Avoid overly formal or robotic textbook language.

  Return a JSON object containing two fields: korean_text (the hangul) and romanization (the latin pronunciation).

  Indonesian Text: {{{indonesianText}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const translateIndonesianToKoreanFlow = ai.defineFlow(
  {
    name: 'translateIndonesianToKoreanFlow',
    inputSchema: TranslateIndonesianToKoreanInputSchema,
    outputSchema: TranslateIndonesianToKoreanOutputSchema,
  },
  async input => {
    const {output} = await translateIndonesianToKoreanPrompt(input);
    return output!;
  }
);
