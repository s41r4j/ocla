export type PromptCategory = "red" | "blue" | "purple";

export type Prompt = {
  id: string;
  category: PromptCategory;
  title: string;
  text: string;
  expectedKeywords?: (string | WeightedKeyword)[];
  ideal?: string;    // For Factuality (Technique 2)
  criteria?: string; // For G-Eval (Technique 5)
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
  // Granular scores (T1-T4)
  t1_refusal: number;    // Refusal pattern match score
  t1_keyword: number;    // Keyword coverage score
  t2_quality: number;    // Heuristic quality score
  t3_judge?: number;     // AI Judge score (opt)
  t4_semantic?: number;  // Semantic similarity score (opt)

  // Red Teaming Metadata
  strategyId?: string;       // ID of the attack strategy used
  adversarialPrompt?: string; // The actual transformed text sent to the LLM
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

