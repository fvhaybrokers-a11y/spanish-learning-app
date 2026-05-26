"use client";

import { Sparkles } from "lucide-react";
import type { DifficultyLevel } from "./spanish-learning-app";

interface PhraseSettingsProps {
  difficulty: DifficultyLevel;
  setDifficulty: (d: DifficultyLevel) => void;
  topic: string;
  setTopic: (t: string) => void;
  topics: string[];
  numPhrases: number;
  setNumPhrases: (n: number) => void;
  pauseAfterEnglish: number;
  setPauseAfterEnglish: (n: number) => void;
  pauseAfterSpanish: number;
  setPauseAfterSpanish: (n: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "Simple vocabulary and basic sentences" },
  { value: "intermediate", label: "Intermediate", description: "Complex sentences with common idioms" },
  { value: "advanced", label: "Advanced", description: "Native-level expressions and slang" },
];

export function PhraseSettings({
  difficulty,
  setDifficulty,
  topic,
  setTopic,
  topics,
  numPhrases,
  setNumPhrases,
  pauseAfterEnglish,
  setPauseAfterEnglish,
  pauseAfterSpanish,
  setPauseAfterSpanish,
  onGenerate,
  isGenerating,
}: PhraseSettingsProps) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground mb-6">
        Lesson Settings
      </h2>

      {/* Difficulty Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Difficulty Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setDifficulty(level.value)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                difficulty === level.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="font-medium">{level.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {level.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Topic
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Number of Phrases */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Number of Phrases: <span className="text-primary font-bold">{numPhrases}</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="7"
            value={numPhrases}
            onChange={(e) => setNumPhrases(parseInt(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
          />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                onClick={() => setNumPhrases(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  numPhrases === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pause Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Pause after English: <span className="text-primary font-bold">{pauseAfterEnglish}s</span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={pauseAfterEnglish}
            onChange={(e) => setPauseAfterEnglish(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0s</span>
            <span>5s</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Pause after Spanish: <span className="text-primary font-bold">{pauseAfterSpanish}s</span>
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={pauseAfterSpanish}
            onChange={(e) => setPauseAfterSpanish(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0s</span>
            <span>5s</span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-5 h-5" />
        {isGenerating ? "Generating Phrases..." : "Generate Phrases"}
      </button>
    </div>
  );
}
