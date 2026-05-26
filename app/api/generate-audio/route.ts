import { NextResponse } from "next/server";
import OpenAI from "openai";
import { put, list } from "@vercel/blob";

interface Phrase {
  id: string;
  spanish: string;
  english: string;
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// Generate a cache key for the combined audio
function getCacheKey(phrases: Phrase[], pauseEnglish: number, pauseSpanish: number): string {
  const phraseKey = phrases
    .map((p) => `${p.english}-${p.spanish}`)
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9|]/g, "-")
    .slice(0, 100);
  return `audio-lessons/${phraseKey}-${pauseEnglish}-${pauseSpanish}.mp3`;
}

async function getFromCache(cacheKey: string): Promise<string | null> {
  if (!isBlobConfigured()) return null;
  try {
    const { blobs } = await list({ prefix: cacheKey });
    return blobs.length > 0 ? blobs[0].url : null;
  } catch {
    return null;
  }
}

async function saveToCache(cacheKey: string, audioBuffer: Buffer): Promise<string | null> {
  if (!isBlobConfigured()) return null;
  try {
    const blob = await put(cacheKey, audioBuffer, {
      access: "public",
      contentType: "audio/mpeg",
    });
    return blob.url;
  } catch {
    return null;
  }
}

// Generate English audio using OpenAI TTS (Nova voice)
async function generateEnglishAudio(text: string): Promise<Buffer> {
  const openai = getOpenAIClient();
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Generate Spanish audio using ElevenLabs
async function generateSpanishAudio(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    // Fallback to OpenAI if ElevenLabs not configured
    console.log("ElevenLabs not configured, falling back to OpenAI for Spanish");
    const openai = getOpenAIClient();
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: text,
    });
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Create silence buffer (approximate - actual silence would need audio processing)
function createSilence(durationSeconds: number): Buffer {
  // MP3 frame of silence (minimal valid MP3 data)
  // This is a simplified approach - for production, use proper audio processing
  const silenceFrameSize = Math.ceil(durationSeconds * 4000); // Approximate bytes for silence
  return Buffer.alloc(silenceFrameSize, 0);
}

export async function POST(request: Request) {
  try {
    const { phrases, pauseAfterEnglish, pauseAfterSpanish } = await request.json();

    if (!phrases || phrases.length === 0) {
      return NextResponse.json({ error: "No phrases provided" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(phrases, pauseAfterEnglish, pauseAfterSpanish);
    const cachedUrl = await getFromCache(cacheKey);
    if (cachedUrl) {
      return NextResponse.json({ audioUrl: cachedUrl, cached: true });
    }

    // Generate audio for each phrase
    const audioChunks: Buffer[] = [];

    for (let i = 0; i < phrases.length; i++) {
      const phrase = phrases[i];

      // Generate English audio
      if (phrase.english) {
        const englishAudio = await generateEnglishAudio(phrase.english);
        audioChunks.push(englishAudio);

        // Add pause after English
        if (pauseAfterEnglish > 0) {
          audioChunks.push(createSilence(pauseAfterEnglish));
        }
      }

      // Generate Spanish audio
      if (phrase.spanish) {
        const spanishAudio = await generateSpanishAudio(phrase.spanish);
        audioChunks.push(spanishAudio);

        // Add pause after Spanish (except for last phrase)
        if (pauseAfterSpanish > 0 && i < phrases.length - 1) {
          audioChunks.push(createSilence(pauseAfterSpanish));
        }
      }
    }

    // Combine all audio chunks
    const combinedAudio = Buffer.concat(audioChunks);

    // Try to cache
    const audioUrl = await saveToCache(cacheKey, combinedAudio);

    if (audioUrl) {
      return NextResponse.json({ audioUrl, cached: false });
    } else {
      // Return as base64 data URL
      const base64Audio = combinedAudio.toString("base64");
      const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;
      return NextResponse.json({ audioUrl: dataUrl, cached: false });
    }
  } catch (error) {
    console.error("Audio generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate audio" },
      { status: 500 }
    );
  }
}
