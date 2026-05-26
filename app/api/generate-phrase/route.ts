import { NextResponse } from "next/server";
import OpenAI from "openai";

// Lazy initialize OpenAI client to avoid errors at module load time
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: Request) {
  try {
    const { category } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Spanish language teacher. Generate a useful Spanish phrase for the category "${category}". 
          
          Respond with ONLY valid JSON in this exact format:
          {"spanish": "the Spanish phrase", "english": "the English translation", "category": "${category}"}
          
          Make the phrases practical and commonly used. Vary the difficulty from beginner to intermediate.`,
        },
        {
          role: "user",
          content: `Generate a Spanish phrase for the category: ${category}`,
        },
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const phrase = JSON.parse(content);
    return NextResponse.json(phrase);
  } catch (error) {
    console.error("Error generating phrase:", error);
    return NextResponse.json(
      { error: "Failed to generate phrase" },
      { status: 500 }
    );
  }
}
