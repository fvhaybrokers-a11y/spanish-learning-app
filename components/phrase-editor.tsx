"use client";

import { Trash2, Plus, GripVertical } from "lucide-react";
import type { Phrase } from "./spanish-learning-app";

interface PhraseEditorProps {
  phrases: Phrase[];
  onUpdate: (id: string, field: "spanish" | "english", value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export function PhraseEditor({ phrases, onUpdate, onRemove, onAdd }: PhraseEditorProps) {
  return (
    <div className="mt-6 p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          Edit Phrases
        </h2>
        <span className="text-sm text-muted-foreground">
          {phrases.length} phrase{phrases.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {phrases.map((phrase, index) => (
          <div
            key={phrase.id}
            className="p-4 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
                <span className="text-sm font-medium w-6">{index + 1}.</span>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    English
                  </label>
                  <input
                    type="text"
                    value={phrase.english}
                    onChange={(e) => onUpdate(phrase.id, "english", e.target.value)}
                    placeholder="Enter English phrase..."
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Spanish
                  </label>
                  <input
                    type="text"
                    value={phrase.spanish}
                    onChange={(e) => onUpdate(phrase.id, "spanish", e.target.value)}
                    placeholder="Enter Spanish translation..."
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => onRemove(phrase.id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Remove phrase"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Custom Phrase
      </button>
    </div>
  );
}
