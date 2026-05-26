"use client";

import { useState, useCallback } from "react";
import { PhraseSettings } from "./phrase-settings";
import { PhraseEditor } from "./phrase-editor";
import { AudioScriptPreview } from "./audio-script-preview";
import { AudioControls } from "./audio-controls";
import { EnvironmentDebugPanel } from "./environment-debug-panel";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

export interface Phrase {
  id: string;
  spanish: string;
  english: string;
}

export interface AudioSettings {
  pauseAfterEnglish: number;
  pauseAfterSpanish: number;
}

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

const TOPICS = [
  "Greetings & Introductions",
  "Food & Dining",
  "Travel & Transportation",
  "Shopping & Money",
  "Directions & Locations",
  "Emergency & Health",
  "Family & Relationships",
  "Work & Business",
  "Weather & Nature",
  "Hobbies & Entertainment",
];

export function SpanishLearningApp() {
  // Settings state
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [numPhrases, setNumPhrases] = useState<number>(3);
  const [pauseAfterEnglish, setPauseAfterEnglish] = useState<number>(2);
  const [pauseAfterSpanish, setPauseAfterSpanish] = useState<number>(3);

  // Phrases state
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isGeneratingPhrases, setIsGeneratingPhrases] = useState(false);

  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // UI state
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePhrases = useCallback(async () => {
    setIsGeneratingPhrases(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch("/api/generate-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          difficulty,
          count: numPhrases,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate phrases");
      }

      const data = await response.json();
      setPhrases(data.phrases);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate phrases");
    } finally {
      setIsGeneratingPhrases(false);
    }
  }, [topic, difficulty, numPhrases]);

  const updatePhrase = useCallback((id: string, field: "spanish" | "english", value: string) => {
    setPhrases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    setAudioUrl(null); // Clear audio when phrases change
  }, []);

  const removePhrase = useCallback((id: string) => {
    setPhrases((prev) => prev.filter((p) => p.id !== id));
    setAudioUrl(null);
  }, []);

  const addPhrase = useCallback(() => {
    const newPhrase: Phrase = {
      id: `custom-${Date.now()}`,
      spanish: "",
      english: "",
    };
    setPhrases((prev) => [...prev, newPhrase]);
    setAudioUrl(null);
  }, []);

  const generateAudio = useCallback(async () => {
    if (phrases.length === 0) return;

    setIsGeneratingAudio(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrases,
          pauseAfterEnglish,
          pauseAfterSpanish,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate audio");
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audio");
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [phrases, pauseAfterEnglish, pauseAfterSpanish]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Spanish Learning App
            </h1>
          </div>
          <p className="text-muted-foreground">
            Generate phrases, customize your lesson, and practice with native pronunciation
          </p>
        </header>

        {/* Collapsible Debug Panel */}
        <div className="mb-6">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDebugPanel ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Environment Status
          </button>
          {showDebugPanel && (
            <div className="mt-2">
              <EnvironmentDebugPanel />
            </div>
          )}
        </div>

        {/* Phrase Generation Settings */}
        <PhraseSettings
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          topic={topic}
          setTopic={setTopic}
          topics={TOPICS}
          numPhrases={numPhrases}
          setNumPhrases={setNumPhrases}
          pauseAfterEnglish={pauseAfterEnglish}
          setPauseAfterEnglish={setPauseAfterEnglish}
          pauseAfterSpanish={pauseAfterSpanish}
          setPauseAfterSpanish={setPauseAfterSpanish}
          onGenerate={generatePhrases}
          isGenerating={isGeneratingPhrases}
        />

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Editable Phrase List */}
        {phrases.length > 0 && (
          <PhraseEditor
            phrases={phrases}
            onUpdate={updatePhrase}
            onRemove={removePhrase}
            onAdd={addPhrase}
          />
        )}

        {/* Audio Script Preview */}
        {phrases.length > 0 && (
          <AudioScriptPreview
            phrases={phrases}
            pauseAfterEnglish={pauseAfterEnglish}
            pauseAfterSpanish={pauseAfterSpanish}
          />
        )}

        {/* Audio Generation & Playback */}
        {phrases.length > 0 && (
          <AudioControls
            onGenerate={generateAudio}
            isGenerating={isGeneratingAudio}
            audioUrl={audioUrl}
            phrasesCount={phrases.length}
          />
        )}
      </div>
    </div>
  );
}
