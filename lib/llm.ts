import type { ProviderPreset } from "@/lib/types";

type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

// Browser console logging helper
export function log(message: string, data?: any) {
    const timestamp = new Date().toISOString().split('T')[1]?.slice(0, 8);
    if (data !== undefined) {
        console.log(`[OCLA ${timestamp}] ${message}`, data);
    } else {
        console.log(`[OCLA ${timestamp}] ${message}`);
    }
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
}

export function isRetryableStatus(status: number) {
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/**
 * Extract text content from various API response formats
 */
export function extractContent(json: any): string | null {
    if (!json) return null;

    // 1. Check for API errors first
    if (json.error) {
        const errorMsg = json.error.message || json.error.code || JSON.stringify(json.error);
        return `[API Error]: ${errorMsg}`;
    }

    // 2. OpenAI / Compatible format
    const choice = json.choices?.[0];
    if (choice) {
        // Standard chat completion
        if (choice.message?.content) {
            const content = choice.message.content;
            if (typeof content === "string") return content;
            // Reasoning models (array of content parts)
            if (Array.isArray(content)) {
                const textParts = content
                    .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
                    .map((p: any) => p.text);
                return textParts.join("\n");
            }
            return JSON.stringify(content);
        }

        // Handle Token Limit / Length finish logic
        if (choice.finish_reason === "length" && !choice.text) {
            return "[Error: Model output limit reached (max tokens). Try increasing the limit.]";
        }

        // Legacy completion
        if (typeof choice.text === "string") {
            return choice.text;
        }

        // Refusal handling
        if (choice.message?.refusal) {
            return `[Refusal]: ${choice.message.refusal}`;
        }
    }

    // 3. Ollama / Other formats
    if (typeof json.response === "string") return json.response; // Ollama default
    if (typeof json.answer === "string") return json.answer;     // Some wrappers
    if (typeof json.generated_text === "string") return json.generated_text; // HuggingFace

    // 4. OpenAI reasoning specialized formats
    if (typeof json.output_text === "string") return json.output_text;
    if (Array.isArray(json.output)) {
        // ... handling complex output arrays ...
        const textParts = json.output
            .filter((item: any) => item?.type === "message" && item?.content)
            .flatMap((item: any) => {
                // Flatten content
                const c = item.content;
                if (typeof c === "string") return [c];
                if (Array.isArray(c)) {
                    return c.map((p: any) => p.text || JSON.stringify(p));
                }
                return [];
            });
        if (textParts.length > 0) return textParts.join("\n");
    }

    // 5. Anthropic format
    if (Array.isArray(json.content)) {
        const textParts = json.content
            .filter((b: any) => b?.type === "text" && typeof b?.text === "string")
            .map((b: any) => b.text);
        if (textParts.length > 0) return textParts.join("\n");
    }

    return null;
}

export async function callOpenAiApi(args: {
    baseUrl: string;
    apiKey?: string;
    model: string;
    messages: LlmMessage[];
    maxTokens: number;
    temperature: number;
}): Promise<string> {
    const url = `${args.baseUrl.replace(/\/$/, "")}/chat/completions`;
    // log(`Calling OpenAI API: ${url}`);
    // log(`Model: ${args.model}, MaxTokens: ${args.maxTokens}, Temp: ${args.temperature}`);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (args.apiKey) {
        headers.Authorization = `Bearer ${args.apiKey}`;
    }

    // Build base request body
    const body: Record<string, unknown> = {
        model: args.model,
        messages: args.messages
    };

    // Determine which token parameter to use
    // OpenAI now requires max_completion_tokens for ALL models
    const model = args.model.toLowerCase();
    const isOpenAiEndpoint = args.baseUrl.includes("api.openai.com");
    const isReasoningModel = model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4");

    if (isOpenAiEndpoint) {
        // OpenAI API: always use max_completion_tokens
        body.max_completion_tokens = args.maxTokens;
        // Only add temperature for non-reasoning models
        if (!isReasoningModel) {
            body.temperature = args.temperature;
        }
    } else {
        // Other providers (Ollama, Groq, etc.): use max_tokens
        body.max_tokens = args.maxTokens;
        body.temperature = args.temperature;
    }

    // log("Request body:", body);

    const res = await fetchWithTimeout(
        url,
        {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        },
        90_000 // 90 second timeout
    );

    const text = await res.text();
    // log(`Response status: ${res.status}`);

    let json: any = null;
    try {
        json = JSON.parse(text);
    } catch {
        // log("Failed to parse response as JSON");
    }

    if (!res.ok) {
        const errorMessage = json?.error?.message ?? text.slice(0, 300);
        // log(`API Error: ${errorMessage}`);
        throw new Error(`API error (${res.status}): ${errorMessage}`);
    }

    const content = extractContent(json);
    if (content === null) {
        // log("Failed to extract content from response:", json);
        const snippet = JSON.stringify(json).slice(0, 500);
        throw new Error(`Failed to extract content. Response snippet: ${snippet}`);
    }

    return content;
}

export async function callAnthropicApi(args: {
    baseUrl: string;
    apiKey?: string;
    model: string;
    messages: LlmMessage[];
    maxTokens: number;
    temperature: number;
}): Promise<string> {
    const url = `${args.baseUrl.replace(/\/$/, "")}/messages`;
    // log(`Calling Anthropic API: ${url}`);

    const system = args.messages.find((m) => m.role === "system")?.content ?? "";
    const messages = args.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
    };
    if (args.apiKey) {
        headers["x-api-key"] = args.apiKey;
    }

    const body = {
        model: args.model,
        system,
        messages,
        max_tokens: args.maxTokens,
        temperature: args.temperature
    };

    // log("Request body:", body);

    const res = await fetchWithTimeout(
        url,
        { method: "POST", headers, body: JSON.stringify(body) },
        90_000
    );

    const text = await res.text();
    // log(`Response status: ${res.status}`);

    let json: any = null;
    try {
        json = JSON.parse(text);
    } catch {
        // log("Failed to parse response as JSON");
    }

    if (!res.ok) {
        const errorMessage = json?.error?.message ?? text.slice(0, 300);
        // log(`API Error: ${errorMessage}`);
        throw new Error(`API error (${res.status}): ${errorMessage}`);
    }

    const content = extractContent(json);
    if (content === null) {
        // log("Failed to extract content from response:", json);
        const snippet = JSON.stringify(json).slice(0, 500);
        throw new Error(`Failed to extract content. Response snippet: ${snippet}`);
    }

    return content;
}

export async function callLlm(
    provider: ProviderPreset,
    args: Parameters<typeof callOpenAiApi>[0]
): Promise<string> {
    if (provider.apiKind === "anthropic-messages") {
        return callAnthropicApi(args);
    }
    return callOpenAiApi(args);
}
