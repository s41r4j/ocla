import type { ProviderPreset } from "@/lib/types";

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "openai",
    name: "OpenAI",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.openai.com/v1",
    browserNotes: "Many hosted APIs block browser CORS. A local proxy may be required."
  },
  {
    id: "groq",
    name: "Groq (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.groq.com/openai/v1"
  },
  {
    id: "openrouter",
    name: "OpenRouter (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: "https://openrouter.ai/api/v1"
  },
  {
    id: "deepseek",
    name: "DeepSeek (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.deepseek.com/v1"
  },
  {
    id: "anthropic",
    name: "Anthropic",
    apiKind: "anthropic-messages",
    baseUrl: "https://api.anthropic.com/v1",
    browserNotes: "Browser CORS may be blocked; consider local-only usage or a proxy."
  },
  {
    id: "ollama",
    name: "Ollama (localhost)",
    apiKind: "openai-chat-completions",
    baseUrl: "http://localhost:11434/v1",
    browserNotes: "Requires CORS enabled on your local server."
  },
  {
    id: "lmstudio",
    name: "LM Studio (localhost)",
    apiKind: "openai-chat-completions",
    baseUrl: "http://localhost:1234/v1",
    browserNotes: "Requires CORS enabled on your local server."
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: ""
  }
];

