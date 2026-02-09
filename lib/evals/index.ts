
import { callLlm } from "@/lib/llm";
import type { ProviderPreset } from "@/lib/types";
import {
    DEFAULT_GRADING_PROMPT,
    PROMPTFOO_FACTUALITY_PROMPT,
    GEVAL_PROMPT_STEPS,
    GEVAL_PROMPT_EVALUATE
} from "./prompts";
import { renderMessages, renderTemplate } from "./templates";

export interface EvalResult {
    score: number;       // 0-1 (normalized) or 0-100 depending on context
    pass: boolean;
    reason: string;
    details?: any;
}

export interface EvalConfig {
    provider?: ProviderPreset;
    baseUrl?: string;
    apiKey?: string;
    model?: string;
}

// -----------------------------------------------------
// 1. Rubric Evaluation (LLM-as-Judge)
// -----------------------------------------------------

export async function evaluateRubric(
    output: string,
    rubric: string,
    config: EvalConfig
): Promise<EvalResult> {
    // 1. Render Prompt
    const messages = renderMessages(DEFAULT_GRADING_PROMPT, {
        output,
        rubric
    });

    // 2. Call LLM
    const provider: ProviderPreset = config.provider || {
        id: "openai-compat",
        name: "Compatible",
        apiKind: "openai-chat-completions",
        baseUrl: config.baseUrl ? config.baseUrl : "https://api.openai.com/v1"
    };

    try {
        const responseText = await callLlm(provider, {
            baseUrl: provider.baseUrl || "https://api.openai.com/v1",
            apiKey: config.apiKey,
            model: config.model || "gpt-4o",
            messages: messages,
            maxTokens: 1000,
            temperature: 0.0
        });

        // 3. Parse JSON
        // Robust parsing to handle potential markdown code blocks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
        const result = JSON.parse(jsonStr);

        return {
            score: result.score, // Promptfoo returns 0.0-1.0 usually
            pass: result.pass,
            reason: result.reason
        };

    } catch (e: any) {
        console.error("Rubric evaluation failed:", e);
        return {
            score: 0,
            pass: false,
            reason: `Evaluation failed: ${e.message}`
        };
    }
}

// -----------------------------------------------------
// 2. Factuality Evaluation
// -----------------------------------------------------

export async function evaluateFactuality(
    input: string,
    output: string,
    expected: string,
    config: EvalConfig
): Promise<EvalResult> {
    const messages = renderMessages(PROMPTFOO_FACTUALITY_PROMPT, {
        input,
        completion: output,
        ideal: expected
    });

    const provider: ProviderPreset = config.provider || {
        id: "openai-compat",
        name: "Compatible",
        apiKind: "openai-chat-completions",
        baseUrl: config.baseUrl ? config.baseUrl : "https://api.openai.com/v1"
    };

    try {
        const responseText = await callLlm(provider, {
            baseUrl: provider.baseUrl || "https://api.openai.com/v1",
            apiKey: config.apiKey,
            model: config.model || "gpt-4o",
            messages: messages,
            maxTokens: 1000,
            temperature: 0.0
        });

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
        const result = JSON.parse(jsonStr);

        // Map category (A/B/C/D/E) to score
        // A (Subset), B (Superset), C (Same Details) -> Pass (High Score)
        // D (Disagreement) -> Fail (Low Score)
        // E (Irrelevant diffs) -> Pass (Medium-High Score)

        let score = 0;
        let pass = false;

        switch (result.category?.toUpperCase()) {
            case 'A': // Consistent subset
            case 'B': // Consistent superset
            case 'C': // Same details
                score = 1;
                pass = true;
                break;
            case 'E': // Trivial differences
                score = 1;
                pass = true;
                break;
            case 'D': // Disagreement
            default:
                score = 0;
                pass = false;
                break;
        }

        return {
            score,
            pass,
            reason: `[${result.category}] ${result.reason}`,
            details: result
        };

    } catch (e: any) {
        return {
            score: 0,
            pass: false,
            reason: `Factuality check failed: ${e.message}`
        };
    }
}

// -----------------------------------------------------
// 3. G-Eval (Criteria-based)
// -----------------------------------------------------

/**
 * G-Eval is a 2-step process:
 * 1. Generate evaluation steps from the criteria (CoT)
 * 2. Evaluate the output using those steps
 */
export async function evaluateGEval(
    input: string,
    output: string,
    criteria: string,
    config: EvalConfig
): Promise<EvalResult> {
    const provider: ProviderPreset = config.provider || {
        id: "openai-compat",
        name: "Compatible",
        apiKind: "openai-chat-completions",
        baseUrl: config.baseUrl ? config.baseUrl : "https://api.openai.com/v1"
    };

    try {
        // Step 1: Generate Steps
        const stepsPrompt = renderTemplate(GEVAL_PROMPT_STEPS, { criteria });
        const stepsResponse = await callLlm(provider, {
            baseUrl: provider.baseUrl || "https://api.openai.com/v1",
            apiKey: config.apiKey,
            model: config.model || "gpt-4o",
            messages: [{ role: "user", content: stepsPrompt }],
            maxTokens: 1000,
            temperature: 0.0
        });

        let steps: string[] = [];
        try {
            const jsonMatch = stepsResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : stepsResponse;
            const parsed = JSON.parse(jsonStr);
            steps = parsed.steps || [];
        } catch {
            console.warn("Failed to parse G-Eval steps, using raw criteria.");
            steps = [criteria];
        }

        // Step 2: Evaluate
        const evalPrompt = renderTemplate(GEVAL_PROMPT_EVALUATE, {
            criteria,
            steps: steps.join("\n- "),
            maxScore: 5, // G-Eval standard is 0-5
            input,
            output
        });

        const evalResponse = await callLlm(provider, {
            baseUrl: provider.baseUrl || "https://api.openai.com/v1",
            apiKey: config.apiKey,
            model: config.model || "gpt-4o",
            messages: [{ role: "user", content: evalPrompt }],
            maxTokens: 1000,
            temperature: 0.0
        });

        const jsonMatch = evalResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : evalResponse;
        const result = JSON.parse(jsonStr);

        // Normalize score to 0-1
        const normalizedScore = (result.score || 0) / 5;

        return {
            score: normalizedScore,
            pass: normalizedScore >= 0.7, // Arbitrary threshold for G-Eval
            reason: result.reason,
            details: { steps, rawScore: result.score }
        };

    } catch (e: any) {
        return {
            score: 0,
            pass: false,
            reason: `G-Eval failed: ${e.message}`
        };
    }
}
