
/**
 * Simple template rendering utility to avoid heavy dependencies like Nunjucks.
 * Supports basic {{ variable }} substitution.
 */
export function renderTemplate(template: string, vars: Record<string, string | number | boolean | null | undefined>): string {
    if (!template) return "";

    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, key) => {
        const value = vars[key.trim()];
        if (value === undefined || value === null) {
            // Keep the tag if variable is missing, or replace with empty string? 
            // Promptfoo usually keeps it or renders empty. We'll render empty to be safe.
            return "";
        }
        return String(value);
    });
}

/**
 * Helper to process the JSON string prompts from Promptfoo which often contain
 * an array of messages [ { role: ..., content: ... }, ... ]
 * 
 * We need to parse it, render templates in the content, and return the messages.
 */
export function renderMessages(
    jsonPrompt: string,
    vars: Record<string, any>
): { role: "system" | "user" | "assistant", content: string }[] {
    try {
        const messages = JSON.parse(jsonPrompt);
        if (!Array.isArray(messages)) {
            throw new Error("Prompt JSON must be an array of messages");
        }

        return messages.map((msg: any) => ({
            role: msg.role,
            content: renderTemplate(msg.content, vars)
        }));
    } catch (e) {
        console.error("Failed to render messages:", e);
        return [];
    }
}
