"use client";

import { useState } from "react";
import type { Provider } from "@/lib/types";

export interface Settings {
  provider: Provider;
  apiKey: string;
  model: string;
}

export default function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}) {
  const [provider, setProvider] = useState<Provider>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-ink">API settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your key is stored only in this browser and sent directly to the provider. It is never
          saved on a server.
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Provider</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvider("github")}
              className={`rounded-lg border px-3 py-2 text-sm ${
                provider === "github"
                  ? "border-accent bg-accent/10 text-accent-dark font-medium"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              GitHub Models <span className="block text-xs text-slate-400">free, rate-limited</span>
            </button>
            <button
              type="button"
              onClick={() => setProvider("openai")}
              className={`rounded-lg border px-3 py-2 text-sm ${
                provider === "openai"
                  ? "border-accent bg-accent/10 text-accent-dark font-medium"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              OpenAI <span className="block text-xs text-slate-400">platform key</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">
            {provider === "github" ? "GitHub token (PAT with models access)" : "OpenAI API key"}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === "github" ? "ghp_..." : "sk-..."}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">
            {provider === "github" ? (
              <>
                Get a free token at{" "}
                <a className="text-accent underline" href="https://github.com/marketplace/models" target="_blank" rel="noreferrer">
                  github.com/marketplace/models
                </a>{" "}
                (fine-grained PAT, Models: read-only).
              </>
            ) : (
              <>
                Get a key at{" "}
                <a className="text-accent underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">
                  platform.openai.com/api-keys
                </a>
                .
              </>
            )}
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Model (optional)</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={provider === "github" ? "openai/gpt-4o" : "gpt-4o"}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ provider, apiKey: apiKey.trim(), model: model.trim() })}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
