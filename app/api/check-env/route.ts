import { NextResponse } from "next/server";

export async function GET() {
  const variables = [
    {
      name: "OPENAI_API_KEY",
      configured: !!process.env.OPENAI_API_KEY,
    },
    {
      name: "ELEVENLABS_API_KEY",
      configured: !!process.env.ELEVENLABS_API_KEY,
    },
    {
      name: "ELEVENLABS_VOICE_ID",
      configured: !!process.env.ELEVENLABS_VOICE_ID,
    },
    {
      name: "BLOB_READ_WRITE_TOKEN",
      configured: !!process.env.BLOB_READ_WRITE_TOKEN,
    },
  ];

  return NextResponse.json({ variables });
}
