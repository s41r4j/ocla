import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "OCLA | Open Cyber LLM Arena",
  description:
    "A transparent, crowdsourced benchmarking platform for evaluating LLMs on cybersecurity tasks."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <ClientProviders>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <header className="flex items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight text-gray-100">
                <Image src="/logo.svg" alt="OCLA Logo" width={32} height={32} className="h-8 w-8" />
                OCLA
              </Link>
              <nav className="flex items-center gap-4 text-sm text-gray-300">
                <Link href="/benchmark">Benchmark</Link>
                <Link href="/leaderboard">Leaderboard</Link>
                <Link href="/protocol">Protocol</Link>
                <a href="https://github.com/s41r4j/ocla" target="_blank" rel="noreferrer">
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
        </ClientProviders>
      </body>
    </html>
  );
}
