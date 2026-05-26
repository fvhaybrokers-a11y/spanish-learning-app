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

  return (
    <div className="mb-6 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--card-foreground)]">
          Environment Variables
        </h3>
        <button
          onClick={checkEnvironment}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--muted-foreground)] ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2">
        {envStatus.map((env) => (
          <div
            key={env.name}
            className="flex items-center justify-between p-2 rounded-lg bg-[var(--muted)]"
          >
            <code className="text-sm font-mono text-[var(--card-foreground)]">
              {env.name}
            </code>
            {env.configured ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        ))}
      </div>

      {envStatus.some((env) => !env.configured) && (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Some environment variables are not configured. Add them in the Vars section of the settings menu.
        </p>
      )}
    </div>
  );
}
