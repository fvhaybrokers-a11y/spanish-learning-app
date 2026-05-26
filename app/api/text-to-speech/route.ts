import { NextResponse } from "next/server";
import OpenAI from "openai";
import { put, list } from "@vercel/blob";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate a cache key from text and provider
function getCacheKey(text: string, provider: string): string {
  const normalized = text.toLowerCase().trim().replace(/[^a-z0-9]/g, "-");
  return `audio-cache/${provider}/${normalized}.mp3`;
}

// Check if audio exists in blob cache
async function getFromCache(cacheKey: string): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix: cacheKey });
    if (blobs.length > 0) {
      return blobs[0].url;
    }
    return null;
  } catch (error) {
    console.error("Cache lookup error:", error);
    return null;
  }
}

// Save audio to blob cache
async function saveToCache(cacheKey: string, audioBuffer: Buffer): Promise<string> {
  const blob = await put(cacheKey, audioBuffer, {
    access: "public",
    contentType: "audio/mpeg",
  });
  return blob.url;
}

// Generate audio using OpenAI TTS
async function generateOpenAIAudio(text: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Generate audio using ElevenLabs TTS
async function generateElevenLabsAudio(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ElevenLabs API key not configured");
  }

  // Using a Spanish-speaking voice (Rachel)
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

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
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: Request) {
  try {
    const { text, provider = "openai" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = getCacheKey(text, provider);
    const cachedUrl = await getFromCache(cacheKey);

    if (cachedUrl) {
      return NextResponse.json({ audioUrl: cachedUrl, cached: true });
    }

    // Generate new audio
    let audioBuffer: Buffer;

    if (provider === "elevenlabs") {
      audioBuffer = await generateElevenLabsAudio(text);
    } else {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
          { error: "OpenAI API key not configured" },
          { status: 500 }
        );
      }
      audioBuffer = await generateOpenAIAudio(text);
    }

    // Save to cache
    const audioUrl = await saveToCache(cacheKey, audioBuffer);

    return NextResponse.json({ audioUrl, cached: false });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate audio" },
      { status: 500 }
    );
  }
}
