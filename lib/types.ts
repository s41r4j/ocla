export type PromptCategory = "red" | "blue" | "purple";

export type Prompt = {
  id: string;
  category: PromptCategory;
  title: string;
  text: string;
  expectedKeywords?: (string | WeightedKeyword)[];
};

export type PromptPack = {
  id: string;
  name: string;
  version: string;
  prompts: Prompt[];
};

export type ApiKind = "openai-chat-completions" | "anthropic-messages";

export type ProviderPreset = {
  id: string;
  name: string;
  apiKind: ApiKind;
  baseUrl: string;
  defaultModel?: string;
  browserNotes?: string;
};

export type WeightedKeyword = {
  word: string;
  weight: number;
};

export type BenchmarkItem = {
  promptId: string;
  category: PromptCategory;
  title: string;
  refused: boolean;
  hedging?: boolean;
  score: number; // 0..100
  matchedKeywords: string[];
  expectedKeywords: string[];
  latencyMs: number;
  responseText: string;
};

export type CategorySummary = {
  category: PromptCategory;
  promptCount: number;
  refusalCount: number;
  refusalRate: number; // 0..1
  avgScore: number; // 0..100
};

export type BenchmarkSummary = {
  byCategory: CategorySummary[];
  totals: {
    promptCount: number;
    refusalRate: number; // 0..1
    avgScore: number; // 0..100
  };
};

export type BenchmarkRun = {
  runId: string;
  createdAt: string; // ISO
  execution: "browser" | "script";
  trustLevel: 1 | 2 | 3;
  trustReason: string;
  providerId: string;
  baseUrl: string;
  model: string;
  promptPackId: string;
  promptPackSha256: string;
  runnerSha256?: string;
  buildSha?: string;
  userHash: string;
  summary: BenchmarkSummary;
  items: BenchmarkItem[];
};

export type SharePayload = Omit<BenchmarkRun, "items">;

