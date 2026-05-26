"use client";

import { FileText, Clock } from "lucide-react";
import type { Phrase } from "./spanish-learning-app";

interface AudioScriptPreviewProps {
  phrases: Phrase[];
  pauseAfterEnglish: number;
  pauseAfterSpanish: number;
}

export function AudioScriptPreview({
  phrases,
  pauseAfterEnglish,
  pauseAfterSpanish,
}: AudioScriptPreviewProps) {
  // Calculate estimated duration
  const wordsPerSecond = 2.5; // Average speaking rate
  let totalDuration = 0;

  phrases.forEach((phrase) => {
    const englishWords = phrase.english.split(" ").length;
    const spanishWords = phrase.spanish.split(" ").length;
    totalDuration += englishWords / wordsPerSecond; // English speaking
    totalDuration += pauseAfterEnglish; // Pause after English
    totalDuration += spanishWords / wordsPerSecond; // Spanish speaking
    totalDuration += pauseAfterSpanish; // Pause after Spanish
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="mt-6 p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">
            Audio Script Preview
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Est. {formatDuration(totalDuration)}</span>
        </div>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {phrases.map((phrase, index) => (
          <div key={phrase.id} className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-start gap-3">
              <span className="text-sm font-bold text-primary">{index + 1}</span>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    EN
                  </span>
                  <span className="text-foreground">
                    {phrase.english || "(empty)"}
                  </span>
                </div>
                {pauseAfterEnglish > 0 && (
                  <div className="text-xs text-muted-foreground italic pl-8">
                    — {pauseAfterEnglish}s pause —
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-600 dark:text-orange-400">
                    ES
                  </span>
                  <span className="text-foreground">
                    {phrase.spanish || "(empty)"}
                  </span>
                </div>
                {pauseAfterSpanish > 0 && index < phrases.length - 1 && (
                  <div className="text-xs text-muted-foreground italic pl-8">
                    — {pauseAfterSpanish}s pause —
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
        <strong>Voice Configuration:</strong>
        <ul className="mt-1 space-y-1">
          <li>• English phrases: OpenAI TTS (Nova voice)</li>
          <li>• Spanish phrases: ElevenLabs (configured voice ID)</li>
        </ul>
      </div>
    </div>
  );
}
