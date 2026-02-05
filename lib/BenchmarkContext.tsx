"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
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

    const startBenchmark = useCallback(async (config: {
        providerId: string;
        baseUrl: string;
        model: string;
        apiKey: string;
        prompts: any[];
        runFn: (args: any) => Promise<BenchmarkItem>;
        onComplete: (results: BenchmarkItem[]) => void;
    }) => {
        if (runningRef.current) return;

        runningRef.current = true;
        cancelRef.current = false;

        const { prompts, runFn, onComplete } = config;
        const results: BenchmarkItem[] = [];

        setState({
            status: "running",
            progress: { current: 0, total: prompts.length },
            results: [],
            summary: null,
            error: null,
            startedAt: Date.now()
        });

        try {
            for (let i = 0; i < prompts.length; i++) {
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
