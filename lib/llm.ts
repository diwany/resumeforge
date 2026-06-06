import type { Provider } from "./types";

/**
 * Both OpenAI and GitHub Models expose an OpenAI-compatible Chat Completions API,
 * so a single client works for both — only the base URL and default model differ.
 *
 *  - OpenAI:        https://api.openai.com/v1
 *  - GitHub Models: https://models.github.ai/inference  (free, rate-limited)
 */
const ENDPOINTS: Record<Provider, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  github: "https://models.github.ai/inference/chat/completions",
};

const DEFAULT_MODEL: Record<Provider, string> = {
  openai: "gpt-4o",
  github: "openai/gpt-4o",
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(opts: {
  provider: Provider;
  apiKey: string;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
}): Promise<string> {
  const { provider, apiKey, messages, temperature = 0.6 } = opts;
  const model = opts.model?.trim() || DEFAULT_MODEL[provider];
  const url = ENDPOINTS[provider];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let detail = text;
    try {
      detail = JSON.parse(text)?.error?.message ?? text;
    } catch {
      /* keep raw text */
    }
    throw new Error(
      `${provider === "github" ? "GitHub Models" : "OpenAI"} request failed (${res.status}): ${detail || res.statusText}`
    );
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("The model returned an empty response.");
  return content.trim();
}
