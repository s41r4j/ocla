"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { BenchmarkProvider } from "@/lib/BenchmarkContext";

export function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <BenchmarkProvider>
            {children}
            <Toaster
                toastOptions={{
                    style: { background: "#0b1220", color: "#e5e7eb", border: "1px solid #1f2937" }
                }}
            />
        </BenchmarkProvider>
    );
}
