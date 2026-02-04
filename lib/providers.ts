import type { ProviderPreset } from "@/lib/types";

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "openai",
    name: "OpenAI",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    browserNotes: "Requires API key. Enter your key below to enable."
  },
  {
    id: "groq",
    name: "Groq (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    browserNotes: "Requires API key from console.groq.com"
  },
  {
    id: "openrouter",
    name: "OpenRouter (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    browserNotes: "Requires API key from openrouter.ai"
  },
  {
    id: "deepseek",
    name: "DeepSeek (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    browserNotes: "Requires API key from platform.deepseek.com"
  },
  {
    id: "anthropic",
    name: "Anthropic",
    apiKind: "anthropic-messages",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    browserNotes: "Browser CORS may be blocked; consider a proxy."
  },
  {
    id: "ollama",
    name: "Ollama (localhost)",
    apiKind: "openai-chat-completions",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    browserNotes: "Requires Ollama running locally with CORS enabled."
  },
  {
    id: "lmstudio",
    name: "LM Studio (localhost)",
    apiKind: "openai-chat-completions",
    baseUrl: "http://localhost:1234/v1",
    defaultModel: "local-model",
    browserNotes: "Requires LM Studio running locally."
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    apiKind: "openai-chat-completions",
    baseUrl: "",
    defaultModel: "",
    browserNotes: "Enter your custom OpenAI-compatible endpoint."
  }
];
