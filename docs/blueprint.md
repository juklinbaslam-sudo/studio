# **App Name**: K-Drama Translator

## Core Features:

- Indonesian to Korean Translation: Translate Indonesian text to conversational Korean using the Gemini API with a K-Drama persona.
- JSON Output: Require the Gemini API to return a JSON object with 'korean_text' and 'romanization' fields.
- Realistic Audio Generation: Generate Korean speech using ElevenLabs API (eleven_multilingual_v2 model) for realistic pronunciation.
- Audio Generation Fallback: Implement a fallback to Gemini API TTS if ElevenLabs API fails to generate audio, to act as a tool guaranteeing service uptime.
- Split-View UI: Modern, dark-themed split-view UI with Indonesian input on top/left and Korean output on bottom/right.
- Output Card with Romanization: Display the translated Korean text (Hangul) in large, bold font, followed by Romanization in a subtle sub-text color.
- Custom Audio Player: Include a custom audio player with play/pause controls and a 'Download MP3' button.
- API Key Settings Modal: Secure modal for users to input their ElevenLabs API key and Gemini API key.

## Style Guidelines:

- Primary color: Deep violet (#673AB7) inspired by the richness and depth of K-Drama aesthetics.
- Background color: Dark grey (#212121) to complement the dark theme.
- Accent color: Soft lavender (#D1C4E9) for interactive elements, creating a calming interface.
- Headline font: 'Space Grotesk', sans-serif, to be paired with 'Inter' for body text; modern and legible.
- Note: currently only Google Fonts are supported.
- Use minimalist icons for audio controls and settings.
- Split-screen layout to allow for simultaneous viewing of both original and translated text.
- Subtle animations on translation and audio playback to provide a smooth user experience.