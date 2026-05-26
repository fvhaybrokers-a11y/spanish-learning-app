"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Download, Volume2, Loader2 } from "lucide-react";

interface AudioControlsProps {
  onGenerate: () => void;
  isGenerating: boolean;
  audioUrl: string | null;
  phrasesCount: number;
}

export function AudioControls({
  onGenerate,
  isGenerating,
  audioUrl,
  phrasesCount,
}: AudioControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    audio.currentTime = clickPosition * duration;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `spanish-lesson-${new Date().toISOString().slice(0, 10)}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">
          Audio Generation
        </h2>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || phrasesCount === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Audio...
          </>
        ) : (
          <>
            <Volume2 className="w-5 h-5" />
            Generate Audio for {phrasesCount} Phrase{phrasesCount !== 1 ? "s" : ""}
          </>
        )}
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-6">
          <audio ref={audioRef} src={audioUrl} preload="auto" />

          {/* Progress Bar */}
          <div
            className="w-full h-3 bg-muted rounded-full overflow-hidden cursor-pointer mb-4"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-sm text-muted-foreground mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={restart}
              className="p-3 rounded-full bg-muted hover:bg-border transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-5 h-5 text-foreground" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={downloadAudio}
              className="p-3 rounded-full bg-muted hover:bg-border transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Audio ready! Click play to listen or download for offline practice.
          </p>
        </div>
      )}
    </div>
  );
}
