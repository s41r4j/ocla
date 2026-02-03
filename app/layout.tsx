import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "OCLA — Open Cyber LLM Arena",
  description:
    "A transparent, crowdsourced benchmarking platform for evaluating LLMs on cybersecurity tasks."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <header className="flex items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <Link href="/" className="text-xl font-semibold tracking-tight text-gray-100">
              OCLA
            </Link>
            <nav className="flex items-center gap-4 text-sm text-gray-300">
              <Link href="/benchmark">Benchmark</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </nav>
          </header>
          <main className="py-6">{children}</main>
          <footer className="border-t border-gray-800 pt-4 text-xs text-gray-400">
            <p>
              Research-only benchmarking. Do not use outputs for unauthorized access. No API keys are
              ever sent to the server when running benchmarks in-browser.
            </p>
          </footer>
        </div>
        <Toaster
          toastOptions={{
            style: { background: "#0b1220", color: "#e5e7eb", border: "1px solid #1f2937" }
          }}
        />
      </body>
    </html>
  );
}

