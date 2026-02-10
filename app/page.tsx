import Link from "next/link";
import { FaShieldAlt, FaTerminal, FaRobot, FaChartLine, FaUserSecret, FaLock } from 'react-icons/fa';

export default function HomePage() {
  return (
    <div className="relative min-h-screen pt-12 pb-6 bg-[#030712] text-white overflow-hidden selection:bg-green-500/30 selection:text-green-200">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-green-500/10 rounded-full blur-[120px] opacity-20" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 space-y-24">

        {/* --- HERO SECTION --- */}
        <section className="pt-16 pb-8 text-center max-w-5xl mx-auto">


          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 leading-[1.1]">
            The Standard for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 font-mono">Open Cyber LLM Arena</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Stop guessing if your LLM is secure or just stubborn. <br className="hidden md:block" />
            OCLA provides <span className="text-gray-100 font-semibold">uncensored, privacy-first benchmarking</span> for offensive and defensive cybersecurity capabilities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/benchmark"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-mono text-base font-bold rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] w-full sm:w-auto"
            >
              <FaTerminal className="w-4 h-4" />
              <span>./START_BENCHMARK</span>
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-gray-300 font-mono text-base font-bold rounded-lg border border-gray-800 hover:border-gray-600 hover:text-white transition-all duration-200 w-full sm:w-auto"
            >
              <FaChartLine className="w-4 h-4" />
              <span>VIEW_LEADERBOARD</span>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 font-mono">
            <span className="flex items-center gap-2"><FaLock className="text-gray-600" /> No Logs Stored</span>
            <span className="flex items-center gap-2"><FaUserSecret className="text-gray-600" /> Anon Ops</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full" /> Live Evals</span>
          </div>
        </section>

        {/* --- THE CHALLENGE --- */}
        <section className="grid lg:grid-cols-2 gap-12 items-center border-t border-gray-800 pt-24">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-600 font-mono">
              The Alignment Trap
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Most LLM benchmarks (MMLU, GSM8K) measure general reasoning, not security utility.
              When you ask a model to help secure a network, does it act as a helpful <span className="text-white font-medium">Red Teamer</span> or does it refuse with a generic safety lecture?
            </p>
            <div className="bg-gray-900/50 p-6 rounded-lg border border-red-500/20">
              <div className="font-mono text-sm text-red-300 mb-2">// Typical Model Response</div>
              <p className="text-gray-500 italic">"I cannot assist with checking for vulnerabilities as it may be unethical..."</p>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              OCLA exists to quantify the fine line between <span className="text-green-400 font-medium">Helpful Security Assistant</span> and <span className="text-red-400 font-medium">Over-Refusal</span>.
            </p>
          </div>
          <div className="relative h-full min-h-[300px] bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-8 flex flex-col justify-center">
            {/* Decorative mock graph/terminal */}
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <FaRobot className="w-32 h-32 text-gray-700" />
            </div>
            <div className="space-y-4 relative z-10 font-mono text-sm">
              <div className="flex justify-between items-center text-gray-400 border-b border-gray-800 pb-2">
                <span>METRIC</span>
                <span>VALUE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">Cybersecurity Knowledge</span>
                <span className="text-white">92.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-400">Refusal Rate (False Pos)</span>
                <span className="text-white">12.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400">Code Safety</span>
                <span className="text-white">98.9%</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section className="space-y-12 border-t border-gray-800 pt-24">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-mono">How It Works</h2>
            <p className="text-gray-400 text-lg">A frictionless, privacy-preserving workflow for security researchers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "1. Connect",
                desc: "Point OCLA to your local inference server (Ollama, LM Studio) or enter a provider API key. Keys are stored locally in your browser.",
                icon: <FaTerminal />,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20"
              },
              {
                title: "2. Benchmark",
                desc: "Run our curated suite of Red Team & Blue Team prompts. We test for SQLi, XSS, Privilege Escalation knowledge, and defensive coding.",
                icon: <FaShieldAlt />,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20"
              },
              {
                title: "3. Analyze & Share",
                desc: "Get instant scoring. View detailed breakdowns of refusals vs. compliance. Optionally, upload anonymous scores to the global leaderboard.",
                icon: <FaChartLine />,
                color: "text-green-400",
                bg: "bg-green-500/10",
                border: "border-green-500/20"
              }
            ].map((step, i) => (
              <div key={i} className={`relative p-8 rounded-xl bg-gray-900/30 border ${step.border} hover:bg-gray-900/50 transition-all duration-300 group`}>
                <div className={`w-12 h-12 rounded-lg ${step.bg} ${step.color} flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3 font-mono">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ / TRUST --- */}
        <section className="border-t border-gray-800 pt-24 pb-12">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl border border-gray-800 p-8 md:p-12">
            <div className="md:flex items-start gap-8">
              <div className="mb-6 md:mb-0 shrink-0">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <FaLock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold font-mono text-white">Privacy is Non-Negotiable</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider">Client-Side Only</h4>
                    <p className="text-gray-400 text-sm">
                      We do not proxy your requests. All benchmark traffic goes directly from your browser to your model provider (OpenAI, Anthropic, or Localhost).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-green-400 font-bold text-sm uppercase tracking-wider">Zero Data Retention</h4>
                    <p className="text-gray-400 text-sm">
                      We never store your API keys, prompts, or model outputs on our servers. The only data we receive is the final numerical score if you choose to submit it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
