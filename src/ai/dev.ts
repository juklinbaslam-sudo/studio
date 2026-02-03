import { config } from 'dotenv';
config();

import '@/ai/flows/fallback-audio-generation.ts';
import '@/ai/flows/generate-realistic-korean-audio.ts';
import '@/ai/flows/translate-indonesian-to-korean.ts';