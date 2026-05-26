import { NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: Request) {
  try {
    const { topic, difficulty, count } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = getOpenAIClient();

    const difficultyDescriptions = {
      beginner: "simple, common vocabulary with basic sentence structures. Include basic greetings, numbers, and everyday phrases.",
      intermediate: "more complex sentences with common idiomatic expressions. Include varied verb tenses and conversational phrases.",
      advanced: "native-level expressions, slang, and sophisticated vocabulary. Include subjunctive mood and complex grammatical structures.",
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Spanish language teacher creating learning materials. Generate exactly ${count} Spanish phrases for the topic "${topic}" at the ${difficulty} level.

Difficulty guidelines for ${difficulty}: ${difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions]}

Respond with ONLY valid JSON in this exact format:
{
  "phrases": [
    {"id": "1", "spanish": "Spanish phrase here", "english": "English translation here"},
    {"id": "2", "spanish": "...", "english": "..."}
  ]
}

Make each phrase practical and useful for real conversations. Ensure variety and progression within the phrases.`,
        },
        {
          role: "user",
          content: `Generate ${count} ${difficulty}-level Spanish phrases about: ${topic}`,
        },
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the JSON response
    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleanContent);

    // Ensure each phrase has a unique ID
    const phrases = data.phrases.map((phrase: { spanish: string; english: string }, index: number) => ({
      id: `phrase-${Date.now()}-${index}`,
      spanish: phrase.spanish,
      english: phrase.english,
    }));

    return NextResponse.json({ phrases });
  } catch (error) {
    console.error("Error generating phrases:", error);
    return NextResponse.json(
      { error: "Failed to generate phrases" },
      { status: 500 }
    );
  }
}
