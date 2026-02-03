'use server';

/**
 * @fileOverview This flow handles text-to-speech conversion, primarily using ElevenLabs API with a fallback to Google Gemini API TTS.
 *
 * - generateFallbackAudio - A function that generates audio from text, using ElevenLabs with Gemini TTS fallback.
 * - GenerateFallbackAudioInput - The input type for the generateFallbackAudio function (string).
 * - GenerateFallbackAudioOutput - The return type for the generateFallbackAudio function (object with media).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import elevenlabs from 'elevenlabs';
import wav from 'wav';

const GenerateFallbackAudioInputSchema = z.string();
export type GenerateFallbackAudioInput = z.infer<typeof GenerateFallbackAudioInputSchema>;

const GenerateFallbackAudioOutputSchema = z.object({
  media: z.string().describe('Audio data URI in WAV format.'),
});
export type GenerateFallbackAudioOutput = z.infer<typeof GenerateFallbackAudioOutputSchema>;

export async function generateFallbackAudio(input: GenerateFallbackAudioInput): Promise<GenerateFallbackAudioOutput> {
  return generateFallbackAudioFlow(input);
}

const generateFallbackAudioFlow = ai.defineFlow(
  {
    name: 'generateFallbackAudioFlow',
    inputSchema: GenerateFallbackAudioInputSchema,
    outputSchema: GenerateFallbackAudioOutputSchema,
  },
  async (text) => {
    try {
      // Attempt to use ElevenLabs API
      const apiKey = process.env.ELEVENLABS_API_KEY;

      if (!apiKey) {
        throw new Error('ElevenLabs API key is missing.  Falling back to Gemini TTS.');
      }

      const voice = new elevenlabs.Voice({
        apiKey,
        voiceId: '2EiwWnXFnvU5JabPUEZv',
      });

      const arrayBuffer = await voice.generate({text, modelId: 'eleven_multilingual_v2'});
      const audioBuffer = Buffer.from(arrayBuffer);
      const wavBase64 = await toWav(audioBuffer);

      return {
        media: `data:audio/wav;base64,${wavBase64}`,
      };
    } catch (error: any) {
      console.error('ElevenLabs API failed:', error.message, '. Falling back to Gemini TTS.');

      // Fallback to Gemini API TTS
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
          prompt: text,
        });
        if (!media) {
          throw new Error('no media returned');
        }
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        return {
          media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
        };
      } catch (geminiError: any) {
        console.error('Gemini TTS API failed:', geminiError.message);
        throw new Error(`ElevenLabs and Gemini TTS APIs failed: ${geminiError.message}`); // Re-throw the error to be handled by the caller.
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
