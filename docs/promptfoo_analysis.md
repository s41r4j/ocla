# Promptfoo Architecture Analysis

## 1. Executive Summary
Promptfoo is a comprehensive CLI tool and library for evaluating, testing, and securing LLM applications. It operates by defining **test cases** (inputs + expected outputs) and running them against **providers** (LLM APIs). Its architecture is split into two primary workflows: **Automated Evaluations** (deterministic & model-graded testing) and **Red Teaming** (adversarial security scanning).

---

## 2. Automated Evaluations

The core of Promptfoo is the evaluation engine, which runs systematic tests against defined prompts.

### 2.1 The Execution Loop
The entry point for evaluations is `src/evaluator.ts`. The `runEval` function orchestrates the lifecycle of a single test case:

1.  **Prompt Rendering**: Nunjucks templates are rendered with variables (`vars`) from the test case.
2.  **Provider Execution**: The configured model (Provider) is called.
    *   *Rate Limiting*: Integrated registry handles concurrency and API limits.
    *   * caching*: Responses are cached by default (`src/cache.ts`) to speed up subsequent runs.
3.  **Transformation**: Optional Javascript/Python hooks transform the output before validation.
4.  **Assertion Verification**: The response is checked against defined assertions.

### 2.2 Assertions & Scoring
Assertions are the "unit tests" for LLM outputs. They are handled in `src/assertions/index.ts` via the `runAssertions` function.

*   **Deterministic Assertions**: Simple checks like `equals`, `contains`, `regex`, `is-json`.
*   **Model-Graded Assertions**: Use an LLM to evaluate the output.
    *   Examples: `answer-relevance`, `factuality`, `sentiment`.
    *   *Mechanism*: These assertions construct a new prompt for a "grader" model (usually GPT-4) asking it to score the output based on a rubric.
*   **Scoring**:
    *   Each assertion returns a `score` (0-1) and a `pass` boolean.
    *   Test cases can have a threshold (e.g., must pass 80% of assertions).

---

## 3. Red Teaming Architecture

Red Teaming in Promptfoo is an automated vulnerability scanner. It actively generates adversarial inputs to "break" the application.

### 3.1 Components
Red teaming is built on three pillars:

1.  **Strategies** (`src/redteam/strategies/`)
    *   *Definition*: The *method* of attack. How the prompt is manipulated.
    *   **GOAT (Generative Offensive Agent Tester)**: Uses a model to generate single-turn attacks based on a goal.
    *   **Iterative**: A multi-turn "game" where an attacker model refines its prompt based on the target's refusal, attempting to bypass guardrails (similar to PAIR/TAP research).
    *   **Jailbreak**: Appends known jailbreak patterns (e.g., "DAN", "Mongo Tom") to prompts.

2.  **Plugins** (`src/redteam/plugins/`)
    *   *Definition*: The *intent* or payload of the attack. What we are trying to inject.
    *   **Categories**:
        *   `harmful`: Hate speech, violent content, self-harm.
        *   `pii`: Attempts to extract personal identifiable information.
        *   `sql-injection`: SQL payloads testing for vulnerability.
        *   `competitors`: Mentioning validity of competitor products.
    *   Each plugin provides a set of "seed" prompts or a generator that creates malicious inputs.

3.  **Graders** (`src/redteam/graders.ts`)
    *   *Definition*: The judge. Was the attack successful?
    *   Specific graders are mapped to plugins (e.g., `PiiGrader` checks if PII was leaked).
    *   Most graders are **Model-Graded Refusal Detectors**: They check if the model refused the request (Safe) or complied with the malicious instruction (Unsafe).

### 3.2 The Attack Flow
1.  **Generation**: The system takes the user's base prompt and applies a **Strategy** + **Plugin**.
    *   *Example*: Strategy=`jailbreak` + Plugin=`harmful:hate` -> Generates a prompt wrapping hate speech in a "movie script" jailbreak.
2.  **Execution**: These adversarial prompts are sent to the target LLM.
3.  **Grading**: The outputs are analyzed by the specific **Grader**.
    *   If the model replies with hate speech -> **FAIL** (Vulnerability found).
    *   If the model says "I cannot generate that" -> **PASS** (Safe).

---

## 4. Key Features & Infrastructure

*   **Provider Registry** (`src/providers/`): A massive adapter layer supporting OpenAI, Anthropic, Azure, Google, Local models (Ollama), and custom scripts.
*   **Vector Caching**: For similarity assertions, embeddings are cached to reduce latency.
*   **Browser & CI Integration**: Results are exported to a local web view (`promptfoo view`) or JSON/HTML reports for CI pipelines.
*   **Configuration**: Supports flexible config via `promptfooconfig.yaml`, allowing dynamic inclusion of local files and scripts.

## 5. Conclusion
Promptfoo is effectively a dual-engine system:
1.  A **Test Runner** for deterministic assurance of prompt quality.
2.  A **Fuzzer** (Red Team) for probabilistic discovery of security flaws.

Its power lies in the **Model-Graded assertions**, which allow it to test semantic quality and safety at scale without human review.
