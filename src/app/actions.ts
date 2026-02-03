
'use server';

import { z } from 'zod';
import { translateIndonesianToKorean } from '@/ai/flows/translate-indonesian-to-korean';
import { generateRealisticKoreanAudio } from '@/ai/flows/generate-realistic-korean-audio';

const TranslateSchema = z.object({
  text: z.string().min(1, 'Please enter text to translate.').max(500, 'Text cannot be longer than 500 characters.'),
});

export interface TranslationResult {
  koreanText: string;
  romanization: string;
  audioDataUri: string;
}

export interface ActionState {
  success: boolean;
  data?: TranslationResult;
  error?: string;
  timestamp?: number;
}

export async function getTranslationAndAudio(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validatedFields = TranslateSchema.safeParse({
    text: formData.get('text'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors.text?.[0] || 'Invalid input.',
    };
  }

  try {
    const translationResult = await translateIndonesianToKorean({ indonesianText: validatedFields.data.text });

    if (!translationResult || !translationResult.koreanText) {
      throw new Error('Translation failed to produce Korean text.');
    }

    const audioResult = await generateRealisticKoreanAudio(translationResult.koreanText);

    if (!audioResult || !audioResult.audioDataUri) {
      throw new Error('Audio generation failed.');
    }

    return {
      success: true,
      data: {
        koreanText: translationResult.koreanText,
        romanization: translationResult.romanization,
        audioDataUri: audioResult.audioDataUri,
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return {
      success: false,
      error: `Process failed. Please ensure your API keys are configured correctly. Details: ${errorMessage}`,
      timestamp: Date.now(),
    };
  }
}
