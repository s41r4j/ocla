
import "dotenv/config";
import { scorePromptResponse, type AIJudgeConfig } from "../lib/scoring";
import type { Prompt } from "../lib/types";

// Mock config
const config: AIJudgeConfig = {
    apiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini"
};

async function runTests() {
    console.log("🚀 Starting Aggregated Scoring Verification...\n");

    // Test 1: Full Pipeline (Rubric + Factuality)
    console.log("--- Test 1: Rubric + Factuality ---");
    const prompt1: Prompt = {
        id: "test1",
        category: "blue",
        title: "Capital of France",
        text: "What is the capital of France?",
        ideal: "Paris" // Trigger Factuality
    };

    const res1 = await scorePromptResponse(prompt1, "The capital of France is Paris.", {
        enableAIJudge: true,
        aiJudgeConfig: config
    });

    console.log("Result 1:", {
        success: res1.successScore,
        quality: res1.qualityScore,
        judges: res1.aiJudge
    });

    if (res1.aiJudge?.factualityScore === 100) console.log("✅ Factuality Triggered & Passed");
    else console.error("❌ Factuality Failed or Not Triggered");
    console.log("\n");

    // Test 2: Full Pipeline (Rubric + G-Eval)
    console.log("--- Test 2: Rubric + G-Eval ---");
    const prompt2: Prompt = {
        id: "test2",
        category: "blue",
        title: "Haiku about Code",
        text: "Write a haiku about code.",
        criteria: "Must follow 5-7-5 syllable structure." // Trigger G-Eval
    };

    const res2 = await scorePromptResponse(prompt2, "Code is very good\nComputers are fast and nice\nI love programming", {
        enableAIJudge: true,
        aiJudgeConfig: config
    });

    console.log("Result 2:", {
        success: res2.successScore,
        quality: res2.qualityScore,
        judges: res2.aiJudge
    });

    if (res2.aiJudge?.gEvalScore !== undefined) console.log("✅ G-Eval Triggered");
    else console.error("❌ G-Eval Not Triggered");
}

if (require.main === module) {
    runTests().catch(console.error);
}
