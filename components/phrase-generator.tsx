"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

const CATEGORIES = [
  "Greetings",
  "Food & Dining",
  "Travel",
  "Shopping",
  "Directions",
  "Emergency",
  "Casual Conversation",
  "Business",
];

interface PhraseGeneratorProps {
  onGenerate: (category: string) => void;
  isGenerating: boolean;
}

export function PhraseGenerator({ onGenerate, isGenerating }: PhraseGeneratorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);

  return (
    <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-4">
        Select a Category
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <button
        onClick={() => onGenerate(selectedCategory)}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-5 h-5" />
        {isGenerating ? "Generating..." : "Generate Spanish Phrase"}
      </button>
    </div>
  );
}
