
export default function ProtocolPage() {
    return (
        <div className="relative min-h-screen py-12">
            <div className="absolute inset-0 z-0 pointer-events-none bg-grid-pattern [mask-image:linear-gradient(to_bottom,white,transparent)]" />

            <main className="relative z-10 mx-auto max-w-4xl px-6 space-y-12">

                {/* Header */}
                <div className="space-y-4 border-b border-white/10 pb-8">
                    <h1 className="text-4xl font-bold tracking-tight">
                        <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                            OCLA Protocol 1.0
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed font-mono">
                        Operational Manifesto, Privacy Standards & Terms of Engagement.
                    </p>
                </div>

                {/* Section 1: Philosophy */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-200 font-mono uppercase tracking-wider flex items-center gap-2">
                        <span className="text-green-500">01.</span> Open Source Philosophy
                    </h2>
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/60 to-gray-900/40 backdrop-blur-md p-6 space-y-4 text-gray-300 leading-relaxed shadow-lg shadow-black/20">
                        <p className="text-lg font-light text-white">
                            The <span className="text-green-400 font-medium">Open Cyber LLM Arena (OCLA)</span> is a transparency engine for the AI era.
                        </p>
                        <p>
                            We believe security assessments should be <strong>auditable, reproducible, and community-driven</strong>. This project is licensed under the <strong>MIT License</strong>, guaranteeing your right to inspect, modify, and deploy this benchmarking logic without restriction.
                        </p>
                    </div>
                </section>

                {/* Section 2: Privacy */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-200 font-mono uppercase tracking-wider flex items-center gap-2">
                        <span className="text-blue-500">02.</span> Privacy Architecture
                    </h2>
                    <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6 space-y-4 text-gray-300 leading-relaxed">
                        <h3 className="font-bold text-white font-mono">Client-Side Execution</h3>
                        <p>
                            OCLA is engineered as a <strong>Privacy-First</strong> platform. All benchmarks logic executes directly in your browser.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                            <li>
                                <strong>API Keys:</strong> Your LLM provider API keys (OpenAI, Anthropic, etc.) are stored strictly in your browser's local storage or memory. They are <strong>NEVER</strong> transmitted to OCLA servers.
                            </li>
                            <li>
                                <strong>Prompt Data:</strong> Benchmark prompts and model responses remain local to your session unless you explicitly choose to submit them to the global leaderboard.
                            </li>
                        </ul>

                        <h3 className="font-bold text-white font-mono mt-6">Voluntary Data Submission</h3>
                        <p>
                            If you choose to use the "Auto-Submit" feature, we collect <strong>only automated telemetry</strong> (scores, refusal rates, latency) and non-identifiable metadata (model name, prompt pack ID, timestamp). We do <strong>NOT</strong> record your IP address, browser fingerprint, or any Personally Identifiable Information (PII) linked to your benchmark results.
                        </p>
                    </div>
                </section>

                {/* Section 3: Terms */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-200 font-mono uppercase tracking-wider flex items-center gap-2">
                        <span className="text-red-500">03.</span> Terms of Engagement
                    </h2>
                    <div className="rounded-xl border border-white/10 bg-gray-900/40 backdrop-blur-md p-6 space-y-4 text-gray-300 leading-relaxed">
                        <p className="border-l-4 border-red-500/50 pl-4 bg-red-900/10 py-2">
                            <strong>WARNING:</strong> This tool is designed for <strong>Authorized Red Teaming and Security Research ONLY</strong>.
                        </p>
                        <p>
                            By utilizing OCLA, you agree to the following:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-red-500">
                            <li>
                                You will not use this platform to generate malicious payloads for use in unauthorized attacks against live systems.
                            </li>
                            <li>
                                You assume full responsibility for the prompts you run and the outputs generated. OCLA authors and contributors are not liable for misuse of this tool.
                            </li>
                            <li>
                                You respect the Terms of Service of the underlying LLM providers (e.g., OpenAI, Anthropic) when running benchmarks against their APIs.
                            </li>
                        </ul>
                    </div>
                </section>

                <footer className="pt-12 text-center text-gray-500 font-mono text-xs">
                    <p>End of Protocol. // OCLA v1.0</p>
                </footer>

            </main>
        </div>
    );
}
