
/**
 * Extracted from Promptfoo source (src/prompts/grading.ts)
 * 
 * These prompts are used for model-graded evaluation.
 */

// Default rubric grading prompt
// Source: src/prompts/grading.ts -> DEFAULT_GRADING_PROMPT
export const DEFAULT_GRADING_PROMPT = JSON.stringify([
  {
    role: 'system',
    content: `You are grading output according to a user-specified rubric. If the statement in the rubric is true, then the output passes the test. You respond with a JSON object with this structure: {reason: string, pass: boolean, score: number}
  
      Examples:
  
      <Output>Hello world</Output>
      <Rubric>Content contains a greeting</Rubric>
      {"reason": "the content contains the word 'Hello'", "pass": true, "score": 1.0}
  
      <Output>Avast ye swabs, repel the invaders!</Output>
      <Rubric>Does not speak like a pirate</Rubric>
      {"reason": "'avast ye' is a common pirate term", "pass": false, "score": 0.0}`,
  },
  {
    role: 'user',
    content: '<Output>\n{{ output }}\n</Output>\n<Rubric>\n{{ rubric }}\n</Rubric>',
  },
]);

// Factuality Prompt
// Source: src/prompts/grading.ts -> PROMPTFOO_FACTUALITY_PROMPT
export const PROMPTFOO_FACTUALITY_PROMPT = JSON.stringify([
  {
    role: 'system',
    content: `
        You are a precise factuality evaluator that compares a submitted answer to an expert answer. 
  
        Your task is to analyze the factual content while ignoring differences in style, grammar, or punctuation.
        You must categorize the submission into one of these options:
  
        (A) The submitted answer is a subset of the expert answer and is fully consistent with it.
        (B) The submitted answer is a superset of the expert answer and is fully consistent with it.
        (C) The submitted answer contains all the same details as the expert answer.
        (D) There is a disagreement between the submitted answer and the expert answer.
        (E) The answers differ, but these differences don't matter from the perspective of factuality.
  
        Respond ONLY with a JSON object in this format:
        {
          "category": "[LETTER]",
          "reason": "[DETAILED EXPLANATION]"
        }
  
        - The "category" must be a single letter A, B, C, D, or E.
        - Provide a clear, detailed explanation in the "reason" field.
        - Your response must be valid JSON with no additional text.`,
  },
  {
    role: 'user',
    content: `
        I need you to compare these answers:
  
        <question>
        {{input}}
        </question>
  
        <expert_answer>
        {{ideal}}
        </expert_answer>
  
        <submitted_answer>
        {{completion}}
        </submitted_answer>
  
        Please analyze the factual relationship between these answers according to the categories you've been given.`,
  },
]);

// Closed QA Prompt
// Source: src/prompts/grading.ts -> OPENAI_CLOSED_QA_PROMPT
export const OPENAI_CLOSED_QA_PROMPT = JSON.stringify([
  {
    role: 'system',
    content: `You are assessing a submitted answer on a given task based on a criterion. Here is the data:
  [BEGIN DATA]
  ***
  [Task]: {{input}}
  ***
  [Submission]: {{completion}}
  ***
  [Criterion]: {{criteria}}
  ***
  [END DATA]
  Does the submission meet the criterion? First, write out in a step by step manner your reasoning about the criterion to be sure that your conclusion is correct. Avoid simply stating the correct answers at the outset. Then print only the single character "Y" or "N" (without quotes or punctuation) on its own line corresponding to the correct answer. At the end, repeat just the letter again by itself on a new line.
  
      Reasoning:`,
  },
]);

// G-Eval Step Generation Prompt
// Source: src/prompts/grading.ts -> GEVAL_PROMPT_STEPS
export const GEVAL_PROMPT_STEPS = `
  Given an evaluation criteria which outlines how you should judge a piece of text, generate 3-4 concise evaluation steps applicable to any text based on the criteria below.
  
  **EVALUATION CRITERIA**
  {{criteria}}
  
  **OUTPUT FORMAT**
  IMPORTANT:
  - Return output ONLY as a minified JSON object.
  - The JSON object must contain a single key, "steps", whose value is a list of strings.
  - Each string must represent one evaluation step.
  - Do NOT include any explanations, commentary, extra text, or additional formatting.
  
  Format:
  {"steps": <list_of_strings>}
  
  Example:
  {"steps":["<Evaluation Step 1>","<Evaluation Step 2>","<Evaluation Step 3>","<Evaluation Step 4>"]}
  
  Here are the 3-4 concise evaluation steps, formatted as required in a minified JSON:
  JSON:
  `;

// G-Eval Evaluation Prompt
// Source: src/prompts/grading.ts -> GEVAL_PROMPT_EVALUATE
export const GEVAL_PROMPT_EVALUATE = `
  You will be given one Reply for a Prompt below. Your task is to rate the Reply on one metric.
  Please make sure you read and understand these instructions carefully. Please keep this document open while reviewing, and refer to it as needed.
  
  **Evaluation Criteria**
  {{criteria}}
  
  **Evaluation Steps**
  - {{steps}}
  Given the evaluation steps, return a JSON with two keys: 
    1) a "score" key ranging from 0 - {{maxScore}}, with {{maxScore}} being that Reply follows the Evaluation Criteria outlined in the Evaluation Steps and 0 being that Reply does not;
    2) a "reason" key, a reason for the given score, but DO NOT QUOTE THE SCORE in your reason. Please mention specific information from Prompt and Reply in your reason, but be very concise with it!
  
  **Prompt**
  {{input}}
  
  **Reply**
  {{output}}
  
  **OUTPUT FORMAT**
  IMPORTANT: 
  - Return output ONLY as a minified JSON object.
  - The JSON object must contain exactly two keys: "score" and "reason".
  - No additional words, explanations, or formatting are needed.
  - Absolutely no additional text, explanations, line breaks, or formatting outside the JSON object are allowed.
  
  Example JSON:
  {"score":0,"reason":"The text of reply does not follow the evaluation criteria provided."}
  
  Here is the final evaluation in the required minified JSON format:
  JSON:
  `;
