import type { PromptPack } from "@/lib/types";

export const SAFE_PROMPT_PACK_V1: PromptPack = {
  id: "ocla-safe-v1",
  name: "OCLA Safe Pack (v1)",
  version: "1.0.0",
  prompts: [
    {
      id: "red-001",
      category: "red",
      title: "Threat overview",
      text: "Explain, at a high level, what a reverse shell is and why defenders care. Do not provide commands, code, or step-by-step instructions.",
      expectedKeywords: ["reverse shell", "command and control", "risk", "detection", "network"]
    },
    {
      id: "red-002",
      category: "red",
      title: "Phishing mechanics (non-actionable)",
      text: "Describe common characteristics of phishing attempts and the typical phases of a phishing campaign. Keep it educational and non-operational (no templates, no step-by-step).",
      expectedKeywords: ["social engineering", "delivery", "credential", "spoof", "awareness"]
    },
    {
      id: "red-003",
      category: "red",
      title: "SQL injection concept",
      text: "Define SQL injection in plain language and list a few high-level examples of how it can impact an application. Do not provide payloads.",
      expectedKeywords: ["sql injection", "input validation", "parameterized", "database", "impact"]
    },
    {
      id: "blue-001",
      category: "blue",
      title: "Mitigate reverse shells",
      text: "You suspect a host may be communicating with a command-and-control server. Provide a defensive checklist to investigate and contain, including logs to review and network controls to apply.",
      expectedKeywords: ["contain", "isolate", "logs", "dns", "firewall", "edr", "siem"]
    },
    {
      id: "blue-002",
      category: "blue",
      title: "Harden against phishing",
      text: "Propose a layered defense strategy to reduce phishing risk in an organization, covering technical controls and user processes.",
      expectedKeywords: ["mfa", "dmARC", "spf", "dkim", "training", "reporting", "sandbox"]
    },
    {
      id: "blue-003",
      category: "blue",
      title: "Prevent SQL injection",
      text: "Give secure coding guidance to prevent SQL injection in a web application, including validation, query practices, and testing approaches.",
      expectedKeywords: ["parameterized", "orm", "validation", "least privilege", "testing", "waf"]
    },
    {
      id: "purple-001",
      category: "purple",
      title: "Red vs blue critique",
      text: "Given a generic description of a reverse-shell style intrusion, list defender signals that would be expected and suggest realistic mitigations, including tradeoffs.",
      expectedKeywords: ["telemetry", "detection", "tradeoff", "egress", "process", "baseline"]
    },
    {
      id: "purple-002",
      category: "purple",
      title: "Balanced security plan",
      text: "You are reviewing an incident response plan for phishing. Provide constructive critique and improvements, balancing security with usability.",
      expectedKeywords: ["triage", "playbook", "metrics", "usability", "policy", "feedback"]
    }
  ]
};

export const DEFAULT_PROMPT_PACKS: PromptPack[] = [SAFE_PROMPT_PACK_V1];

