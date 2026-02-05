"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import type { BenchmarkSummary, BenchmarkItem } from "@/lib/types";

export type BenchmarkStatus = "idle" | "running" | "completed" | "error";

export interface BenchmarkState {
    status: BenchmarkStatus;
    progress: {
        current: number;
        total: number;
        currentPrompt?: string;
    };
    results: BenchmarkItem[];
    summary: BenchmarkSummary | null;
    error: string | null;
    startedAt: number | null;
    config?: {
        providerId: string;
        baseUrl: string;
        model: string;
        apiKey: string;
        promptsCount: number;
    };
}

interface BenchmarkContextType {
    state: BenchmarkState;
    startBenchmark: (config: {
        providerId: string;
        baseUrl: string;
        model: string;
        apiKey: string;
        prompts: any[];
        runFn: (args: any) => Promise<BenchmarkItem>;
        onComplete: (results: BenchmarkItem[]) => void;
        resume?: boolean;
    }) => void;
    cancelBenchmark: () => void;
    resetState: () => void;
}

const initialState: BenchmarkState = {
    status: "idle",
    progress: { current: 0, total: 0 },
    results: [],
    summary: null,
    error: null,
    startedAt: null
};

const BenchmarkContext = createContext<BenchmarkContextType | null>(null);

export function BenchmarkProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BenchmarkState>(initialState);
    const cancelRef = useRef(false);
    const runningRef = useRef(false);
    const isHydrated = useRef(false);

    // Initialize state from localStorage
    useEffect(() => {
        if (typeof window === "undefined" || isHydrated.current) return;
        const saved = localStorage.getItem("ocla_benchmark_state_v1");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.status !== "idle" || parsed.results.length > 0) {
                    // If it was "running", set to "idle" so user can verify/resume manually
                    if (parsed.status === "running") parsed.status = "idle";
                    setState(parsed);
                }
            } catch (e) {
                console.error("Failed to parse saved benchmark state", e);
            }
        }
        isHydrated.current = true;
    }, []);

    // Save state changes to localStorage
    useEffect(() => {
        if (!isHydrated.current) return;
        if (state.status === "idle" && state.results.length === 0) {
            localStorage.removeItem("ocla_benchmark_state_v1");
        } else {
            localStorage.setItem("ocla_benchmark_state_v1", JSON.stringify(state));
        }
    }, [state]);

    const startBenchmark = useCallback(async (config: {
        providerId: string;
        baseUrl: string;
        model: string;
        apiKey: string;
        prompts: any[];
        runFn: (args: any) => Promise<BenchmarkItem>;
        onComplete: (results: BenchmarkItem[]) => void;
        resume?: boolean;
    }) => {
        if (runningRef.current) return;

        runningRef.current = true;
        cancelRef.current = false;

        const { prompts, runFn, onComplete, resume } = config;

        // If resuming, use existing results length as start index
        const startIndex = resume ? state.results.length : 0;

        // Initialize local results tracker
        const results: BenchmarkItem[] = resume ? [...state.results] : [];

        if (!resume) {
            setState({
                status: "running",
                progress: { current: 0, total: prompts.length },
                results: [],
                summary: null,
                error: null,
                startedAt: Date.now(),
                config: {
                    providerId: config.providerId,
                    baseUrl: config.baseUrl,
                    model: config.model,
                    apiKey: config.apiKey,
                    promptsCount: config.prompts.length
                }
            });
        } else {
            setState(s => ({
                ...s,
                status: "running",
                error: null
            }));
        }

        try {
            // Append explicit results array for local tracking in this run context
            // But we primarily update state directly
            // For resume, we need to respect already completed items

            for (let i = startIndex; i < prompts.length; i++) {
                if (cancelRef.current) {
                    setState(s => ({ ...s, status: "idle", error: "Cancelled by user" }));
                    runningRef.current = false;
                    return;
                }

                const prompt = prompts[i];
                setState(s => ({
                    ...s,
                    progress: {
                        current: i,
                        total: prompts.length,
                        currentPrompt: prompt.name || `Prompt ${i + 1}`
                    }
                }));

                const result = await runFn({
                    ...config,
                    prompt
                });

                results.push(result);
                setState(s => ({
                    ...s,
                    results: [...s.results, result],
                    progress: { ...s.progress, current: i + 1 }
                }));
            }

            setState(s => ({
                ...s,
                status: "completed",
                progress: { current: prompts.length, total: prompts.length }
            }));

            onComplete(results);
        } catch (error) {
            setState(s => ({
                ...s,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error"
            }));
        } finally {
            runningRef.current = false;
        }
    }, []);

    const cancelBenchmark = useCallback(() => {
        cancelRef.current = true;
    }, []);

    const resetState = useCallback(() => {
        if (!runningRef.current) {
            setState(initialState);
        }
    }, []);

    return (
        <BenchmarkContext.Provider value={{ state, startBenchmark, cancelBenchmark, resetState }}>
            {children}
        </BenchmarkContext.Provider>
    );
}

export function useBenchmark() {
    const context = useContext(BenchmarkContext);
    if (!context) {
        throw new Error("useBenchmark must be used within BenchmarkProvider");
    }
    return context;
}
