export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function safeJsonParse<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
    return bufferToHex(digest);
  }

  const nodeCrypto = await import("crypto");
  const hash = nodeCrypto.createHash("sha256").update(data).digest("hex");
  return hash;
}

export function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function downloadTextFile(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function nowIso() {
  return new Date().toISOString();
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function getOrCreateUserHash() {
  const key = "ocla:userHash";
  const existing = globalThis.localStorage?.getItem(key);
  if (existing) return existing;
  const value = globalThis.crypto?.randomUUID?.() ?? `u_${Math.random().toString(16).slice(2)}`;
  globalThis.localStorage?.setItem(key, value);
  return value;
}

