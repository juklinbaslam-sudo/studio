'use server';
/**
 * @fileOverview Generates realistic Korean audio from Korean text using ElevenLabs API with a fallback to Gemini TTS.
 *
 * - generateRealisticKoreanAudio - A function that generates realistic Korean audio from Korean text.
 * - GenerateRealisticKoreanAudioInput - The input type for the generateRealisticKoreanAudio function.
 * - GenerateRealisticKoreanAudioOutput - The return type for the generateRealisticKoreanAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateRealisticKoreanAudioInputSchema = z.string().describe('The Korean text to be converted to speech.');
export type GenerateRealisticKoreanAudioInput = z.infer<typeof GenerateRealisticKoreanAudioInputSchema>;

const GenerateRealisticKoreanAudioOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio data URI in WAV format.'),
});
export type GenerateRealisticKoreanAudioOutput = z.infer<typeof GenerateRealisticKoreanAudioOutputSchema>;

export async function generateRealisticKoreanAudio(input: GenerateRealisticKoreanAudioInput): Promise<GenerateRealisticKoreanAudioOutput> {
  return generateRealisticKoreanAudioFlow(input);
}

const generateRealisticKoreanAudioFlow = ai.defineFlow(
  {
    name: 'generateRealisticKoreanAudioFlow',
    inputSchema: GenerateRealisticKoreanAudioInputSchema,
    outputSchema: GenerateRealisticKoreanAudioOutputSchema,
  },
  async query => {
    try {
      // Attempt to use ElevenLabs API
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        throw new Error('ElevenLabs API key is missing.');
      }

      const voiceId = '21m00Tcm4TlvDq8ik2Lx'; // Example voice ID, replace with desired Korean voice
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: query,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        console.error('ElevenLabs API Error:', response.status, response.statusText);
        throw new Error(`ElevenLabs API failed: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      const base64Audio = audioBuffer.toString('base64');

      return {audioDataUri: `data:audio/mpeg;base64,${base64Audio}`};
    } catch (error: any) {
      console.error('ElevenLabs failed, falling back to Gemini TTS:', error);
      // Fallback to Gemini TTS
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.5-flash-preview-tts',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {voiceName: 'Algenib'},
              },
            },
          },
          prompt: query,
        });

        if (!media) {
          throw new Error('no media returned from Gemini TTS');
        }
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        return {
          audioDataUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
        };
      } catch (geminiError: any) {
        console.error('Gemini TTS failed:', geminiError);
        throw new Error(`Gemini TTS failed: ${geminiError.message}`);
      }
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
