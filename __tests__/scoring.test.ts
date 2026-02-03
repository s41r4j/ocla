import { detectRefusal, scoreKeywordCoverage, scorePromptResponse } from "@/lib/scoring";
import type { Prompt } from "@/lib/types";

describe("scoring", () => {
  test("detectRefusal matches common refusal phrasing", () => {
    expect(detectRefusal("I'm sorry, I can't help with that.")).toBe(true);
    expect(detectRefusal("Here are some general best practices.")).toBe(false);
  });

  test("scoreKeywordCoverage returns 0..100", () => {
    expect(scoreKeywordCoverage(["alpha", "beta"], "alpha only")).toBe(50);
    expect(scoreKeywordCoverage(["alpha", "beta"], "alpha beta")).toBe(100);
    expect(scoreKeywordCoverage([], "anything")).toBe(50);
  });

  test("scorePromptResponse returns 0 when refused", () => {
    const prompt: Prompt = {
      id: "t",
      category: "blue",
      title: "t",
      text: "t",
      expectedKeywords: ["patch"]
    };
    const scored = scorePromptResponse(prompt, "I can't provide that.");
    expect(scored.refused).toBe(true);
    expect(scored.score).toBe(0);
  });
});

