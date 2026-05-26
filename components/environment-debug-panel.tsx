"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface EnvStatus {
  name: string;
  configured: boolean;
}

export function EnvironmentDebugPanel() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkEnvironment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/check-env");
      const data = await response.json();
      setEnvStatus(data.variables);
    } catch (error) {
      console.error("Failed to check environment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  const configuredCount = envStatus.filter((e) => e.configured).length;
  const totalCount = envStatus.length;

  return (
    <div className="p-4 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Environment Variables
          </span>
          <span className="text-xs text-muted-foreground">
            ({configuredCount}/{totalCount} configured)
          </span>
        </div>
        <button
          onClick={checkEnvironment}
          disabled={isLoading}
          className="p-1.5 rounded hover:bg-border transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-muted-foreground ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {envStatus.map((env) => (
          <div
            key={env.name}
            className="flex items-center gap-2 p-2 rounded bg-background"
          >
            {env.configured ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <code className="text-xs font-mono text-foreground truncate">
              {env.name.replace(/^(OPENAI_|ELEVENLABS_|BLOB_)/, "")}
            </code>
          </div>
        ))}
      </div>

      {envStatus.some((env) => !env.configured) && (
        <p className="mt-3 text-xs text-muted-foreground">
          Missing variables can be added in Settings &gt; Vars
        </p>
      )}
    </div>
  );
}
