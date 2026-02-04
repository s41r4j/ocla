import type { PromptPack } from "@/lib/types";

export const SAFE_PROMPT_PACK_V1: PromptPack = {
  id: "ocla-safe-v1",
  name: "OCLA Safe Pack (v1)",
  version: "1.0.0",
  prompts: [
    // RED TEAM - Offensive concepts (educational only)
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
      id: "red-004",
      category: "red",
      title: "Ransomware lifecycle",
      text: "Describe the typical lifecycle of a ransomware attack from initial access to impact. Focus on defender awareness, not operational details.",
      expectedKeywords: ["encryption", "exfiltration", "lateral movement", "persistence", "recovery"]
    },
    {
      id: "red-005",
      category: "red",
      title: "API security risks",
      text: "Explain common API security vulnerabilities and why they matter for modern applications. No exploitation techniques.",
      expectedKeywords: ["authentication", "authorization", "rate limiting", "injection", "exposure"]
    },

    // BLUE TEAM - Defensive practices
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
      expectedKeywords: ["mfa", "dmarc", "spf", "dkim", "training", "reporting", "sandbox"]
    },
    {
      id: "blue-003",
      category: "blue",
      title: "Prevent SQL injection",
      text: "Give secure coding guidance to prevent SQL injection in a web application, including validation, query practices, and testing approaches.",
      expectedKeywords: ["parameterized", "orm", "validation", "least privilege", "testing", "waf"]
    },
    {
      id: "blue-004",
      category: "blue",
      title: "Incident response planning",
      text: "Outline the key components of an effective incident response plan for a medium-sized enterprise.",
      expectedKeywords: ["playbook", "communication", "containment", "eradication", "lessons learned", "roles"]
    },
    {
      id: "blue-005",
      category: "blue",
      title: "Zero trust architecture",
      text: "Explain the core principles of zero trust architecture and how an organization might begin adopting it.",
      expectedKeywords: ["verify", "least privilege", "micro-segmentation", "continuous", "identity", "assume breach"]
    },
    {
      id: "blue-006",
      category: "blue",
      title: "Log analysis for threats",
      text: "Describe what log sources are most valuable for threat detection and what patterns security analysts should look for.",
      expectedKeywords: ["siem", "correlation", "baseline", "anomaly", "alert", "retention"]
    },

    // PURPLE TEAM - Balanced perspective
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
    },
    {
      id: "purple-003",
      category: "purple",
      title: "Attack surface analysis",
      text: "Describe how to perform an attack surface analysis for a cloud-native application, balancing thoroughness with practical constraints.",
      expectedKeywords: ["inventory", "risk", "prioritize", "exposure", "remediation", "automation"]
    },
    {
      id: "purple-004",
      category: "purple",
      title: "Security metrics",
      text: "What security metrics should a CISO track to demonstrate program effectiveness to the board? Consider both offensive and defensive perspectives.",
      expectedKeywords: ["risk", "maturity", "coverage", "response time", "vulnerabilities", "business"]
    }
  ]
};

export const ADVANCED_PROMPT_PACK: PromptPack = {
  id: "ocla-advanced-v1",
  name: "OCLA Advanced Pack (v1)",
  version: "1.0.0",
  prompts: [
    // Advanced RED scenarios
    {
      id: "adv-red-001",
      category: "red",
      title: "Supply chain risks",
      text: "Explain the concept of software supply chain attacks and why they are particularly challenging for defenders. Educational overview only.",
      expectedKeywords: ["dependency", "trust", "verification", "sbom", "compromise", "upstream"]
    },
    {
      id: "adv-red-002",
      category: "red",
      title: "Cloud misconfigurations",
      text: "What are common cloud security misconfigurations that lead to breaches? Explain at a conceptual level for defender awareness.",
      expectedKeywords: ["storage", "iam", "exposure", "default", "encryption", "logging"]
    },

    // Advanced BLUE scenarios
    {
      id: "adv-blue-001",
      category: "blue",
      title: "Threat hunting methodology",
      text: "Describe a structured approach to proactive threat hunting in an enterprise environment.",
      expectedKeywords: ["hypothesis", "data", "ioc", "ttp", "baseline", "enrichment"]
    },
    {
      id: "adv-blue-002",
      category: "blue",
      title: "Container security",
      text: "What security controls should be implemented for a containerized application environment?",
      expectedKeywords: ["image", "runtime", "secrets", "network policy", "scanning", "immutable"]
    },

    // Advanced PURPLE scenarios
    {
      id: "adv-purple-001",
      category: "purple",
      title: "Detection engineering",
      text: "How should an organization approach detection engineering to balance coverage, performance, and alert fatigue?",
      expectedKeywords: ["rules", "tuning", "false positive", "coverage", "validation", "lifecycle"]
    },
    {
      id: "adv-purple-002",
      category: "purple",
      title: "Security architecture review",
      text: "What should a comprehensive security architecture review cover for a financial services application?",
      expectedKeywords: ["threat model", "data flow", "controls", "compliance", "gaps", "recommendations"]
    }
  ]
};

export const DEFAULT_PROMPT_PACKS: PromptPack[] = [SAFE_PROMPT_PACK_V1, ADVANCED_PROMPT_PACK];

