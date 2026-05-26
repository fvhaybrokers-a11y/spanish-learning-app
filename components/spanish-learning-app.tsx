"use client";

import { useState } from "react";
import { PhraseGenerator } from "./phrase-generator";
import { AudioPlayer } from "./audio-player";
import { EnvironmentDebugPanel } from "./environment-debug-panel";
import { Volume2, BookOpen, Settings } from "lucide-react";

export type TTSProvider = "openai" | "elevenlabs";

export interface Phrase {
  spanish: string;
  english: string;
  category: string;
}

export function SpanishLearningApp() {
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ttsProvider, setTtsProvider] = useState<TTSProvider>("openai");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePhrase = async (category: string) => {
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch("/api/generate-phrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate phrase");
      }

      const phrase: Phrase = await response.json();
      setCurrentPhrase(phrase);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate phrase");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async () => {
    if (!currentPhrase) return;

    setIsLoadingAudio(true);
    setError(null);

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentPhrase.spanish,
          provider: ttsProvider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const { audioUrl: url, cached } = await response.json();
      setAudioUrl(url);
      if (cached) {
        console.log("Audio loaded from cache");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audio");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-[var(--primary)]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Spanish Learning App
            </h1>
          </div>
          <p className="text-[var(--muted-foreground)]">
            Generate phrases and listen to native pronunciation
          </p>
        </header>

        {/* TTS Provider Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-sm text-[var(--muted-foreground)]">TTS Provider:</span>
          <div className="flex rounded-lg overflow-hidden border border-[var(--border)]">
            <button
              onClick={() => setTtsProvider("openai")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                ttsProvider === "openai"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => setTtsProvider("elevenlabs")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                ttsProvider === "elevenlabs"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--card)] text-[var(--card-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              ElevenLabs
            </button>
          </div>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            title="Environment Debug Panel"
          >
            <Settings className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Debug Panel */}
        {showDebugPanel && <EnvironmentDebugPanel />}

        {/* Phrase Generator */}
        <PhraseGenerator
          onGenerate={generatePhrase}
          isGenerating={isGenerating}
        />

        {/* Current Phrase Display */}
        {currentPhrase && (
          <div className="mt-6 p-6 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-2">
                {currentPhrase.spanish}
              </p>
              <p className="text-lg text-[var(--muted-foreground)] mb-4">
                {currentPhrase.english}
              </p>
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                {currentPhrase.category}
              </span>
            </div>

            {/* Audio Controls */}
            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                onClick={generateAudio}
                disabled={isLoadingAudio}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Volume2 className="w-5 h-5" />
                {isLoadingAudio ? "Generating Audio..." : "Listen to Pronunciation"}
              </button>

              {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
