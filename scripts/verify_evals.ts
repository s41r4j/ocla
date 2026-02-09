
import { evaluateRubric, evaluateFactuality, evaluateGEval } from "../lib/evals/index";

// Mock config - in real usage this comes from env vars or context
const config = {
    apiKey: process.env.OPENAI_API_KEY || undefined,
    model: "gpt-4o-mini"
    // baseUrl is undefined, let it fallback 
};

async function runTests() {
    console.log("🚀 Starting OCLA Evals Verification...\n");

    // Test 1: Rubric Evaluation
    console.log("--- Test 1: Rubric Evaluation ---");
    const rubricResult = await evaluateRubric(
        "The capital of France is Paris.",
        "The output should state the capital of France.",
        config
    );
    console.log("Input: 'The capital of France is Paris.'");
    console.log("Rubric: 'The output should state the capital of France.'");
    console.log("Result:", rubricResult);
    if (rubricResult.pass) console.log("✅ Rubric Test Passed");
    else console.error("❌ Rubric Test Failed");
    console.log("\n");

    // Test 2: Factuality Evaluation
    console.log("--- Test 2: Factuality Evaluation ---");
    const factResult = await evaluateFactuality(
        "Who is the CEO of Tesla?",
        "Elon Musk is the CEO of Tesla.",
        "Elon Musk",
        config
    );
    console.log("Input: 'Who is the CEO of Tesla?'");
    console.log("Output: 'Elon Musk is the CEO of Tesla.'");
    console.log("Ideal: 'Elon Musk'");
    console.log("Result:", factResult);
    if (factResult.pass) console.log("✅ Factuality Test Passed");
    else console.error("❌ Factuality Test Failed");
    console.log("\n");

    // Test 3: G-Eval
    console.log("--- Test 3: G-Eval ---");
    const gEvalResult = await evaluateGEval(
        "Write a short poem about coding.",
        "Code flows like a river,\nBugs are stones in the stream,\nDebug and deliver,\nLiving the developer dream.",
        "The poem must rhyme and be about programming.",
        config
    );
    console.log("Criteria: 'The poem must rhyme and be about programming.'");
    console.log("Result:", gEvalResult);
    if (gEvalResult.pass) console.log("✅ G-Eval Test Passed");
    else console.error("❌ G-Eval Test Failed");
    console.log("\n");
}

// Simple runner
if (require.main === module) {
    runTests().catch(console.error);
}
