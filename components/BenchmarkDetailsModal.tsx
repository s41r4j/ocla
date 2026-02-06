import { Dialog } from "@headlessui/react";
import { CopyIcon, XIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import type { BenchmarkItem } from "@/lib/types";

export function BenchmarkDetailsModal({
    item,
    isOpen,
    onClose
}: {
    item: BenchmarkItem | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [copied, setCopied] = useState(false);

    if (!item) return null;

    const copyToClipboard = () => {
        const text = `PROMPT:\n${item.title}\n\nRESPONSE:\n${item.responseText}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-5xl rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                        <div>
                            <Dialog.Title className="text-xl font-bold text-gray-100">
                                Benchmark Details
                            </Dialog.Title>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${item.category === 'red' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                        item.category === 'blue' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                                    }`}>
                                    {item.category}
                                </span>
                                <span>{item.title}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[60vh]">
                        {/* Left Col: Prompt & Response */}
                        <div className="flex flex-col gap-4 h-full overflow-hidden">
                            <div className="flex-1 overflow-hidden flex flex-col rounded-lg border border-gray-800 bg-gray-900/30">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-800">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Response</span>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto p-4">
                                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                                        {item.responseText}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Stats & Analysis */}
                        <div className="h-full overflow-y-auto pr-2 space-y-6">

                            {/* Score Card */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 rounded-lg border border-gray-800 bg-gray-900/30 p-4">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Overall Score</div>
                                    <div className={`text-4xl font-bold ${item.score > 80 ? 'text-green-400' :
                                            item.score > 50 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {item.score}
                                        <span className="text-sm text-gray-600 font-normal ml-2">/ 100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="rounded-lg border border-gray-800 bg-gray-900/30 overflow-hidden">
                                <div className="px-4 py-2 bg-gray-900/50 border-b border-gray-800">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Breakdown</span>
                                </div>
                                <div className="divide-y divide-gray-800">
                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-200">T1: Refusal & Keywords</div>
                                            <div className="text-xs text-gray-500 mt-0.5">Refusal Score: <span className={item.t1_refusal > 0 ? "text-red-400" : "text-gray-400"}>{item.t1_refusal}</span> • Keywords Matched: {Math.round(item.t1_keyword)}%</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">Keywords</div>
                                            <div className="font-mono text-gray-300">{item.matchedKeywords.length}/{item.expectedKeywords.length}</div>
                                        </div>
                                    </div>

                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-200">T2: Quality Heuristics</div>
                                            <div className="text-xs text-gray-500 mt-0.5">Length, Formatting, Technical Terms</div>
                                        </div>
                                        <div className="font-mono text-xl text-gray-300">{Math.round(item.t2_quality)}</div>
                                    </div>

                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-200">T3: AI Judge</div>
                                            <div className="text-xs text-gray-500 mt-0.5">LLM Analysis of helpfulness/evasion</div>
                                        </div>
                                        <div className="font-mono text-xl text-gray-300">
                                            {item.t3_judge !== undefined ? Math.round(item.t3_judge) : <span className="text-gray-600">-</span>}
                                        </div>
                                    </div>

                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-200">T4: Semantic Check</div>
                                            <div className="text-xs text-gray-500 mt-0.5">Relevance to prompt</div>
                                        </div>
                                        <div className="font-mono text-xl text-gray-300">
                                            {item.t4_semantic !== undefined ? Math.round(item.t4_semantic) : <span className="text-gray-600">-</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Latency */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 justify-end">
                                <span>Latency: {item.latencyMs}ms</span>
                                <span>•</span>
                                <span>Tokens (est): {Math.round(item.responseText.length / 4)}</span>
                            </div>

                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
