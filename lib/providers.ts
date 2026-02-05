import type { ProviderPreset } from "@/lib/types";

export const PROVIDER_PRESETS: ProviderPreset[] = [
  // Major Cloud Providers
  {
    id: "openai",
    name: "OpenAI",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    browserNotes: "Requires API key from platform.openai.com"
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
    id: "gemini",
    name: "Google Gemini",
    apiKind: "openai-chat-completions",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.0-flash",
    browserNotes: "Get API key from aistudio.google.com"
  },
  {
    id: "mistral",
    name: "Mistral AI",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-large-latest",
    browserNotes: "Get API key from console.mistral.ai"
  },

  // Inference Platforms
  {
    id: "groq",
    name: "Groq",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    browserNotes: "Lightning fast! Get key from console.groq.com"
  },
  {
    id: "together",
    name: "Together AI",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.together.xyz/v1",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    browserNotes: "Get API key from api.together.ai"
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    defaultModel: "accounts/fireworks/models/llama-v3p3-70b-instruct",
    browserNotes: "Get API key from fireworks.ai"
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    apiKind: "openai-chat-completions",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    browserNotes: "Access 100+ models from openrouter.ai"
  },
  {
    id: "perplexity",
    name: "Perplexity",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.perplexity.ai",
    defaultModel: "llama-3.1-sonar-large-128k-online",
    browserNotes: "Get API key from perplexity.ai/settings/api"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    browserNotes: "Get API key from platform.deepseek.com"
  },
  {
    id: "cohere",
    name: "Cohere",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.cohere.ai/v1",
    defaultModel: "command-r-plus",
    browserNotes: "Get API key from dashboard.cohere.com"
  },
  {
    id: "xai",
    name: "xAI Grok",
    apiKind: "openai-chat-completions",
    baseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-2-latest",
    browserNotes: "Get API key from console.x.ai"
  },

  // Local Models
  {
    id: "ollama",
    name: "Ollama",
    apiKind: "openai-chat-completions",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    browserNotes: "Run locally with: ollama serve"
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    apiKind: "openai-chat-completions",
    baseUrl: "http://localhost:1234/v1",
    defaultModel: "local-model",
    browserNotes: "Start server in LM Studio settings"
  },

  // Custom
  {
    id: "custom",
    name: "Custom",
    apiKind: "openai-chat-completions",
    baseUrl: "",
    defaultModel: "",
    browserNotes: "Any OpenAI-compatible endpoint"
  }
];
