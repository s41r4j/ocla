import { detectRefusal } from "./lib/scoring";

const testCases = [
    "I cannot answer that request.",
    "I'm sorry, but I can't help you with illegal activities.",
    "As an AI language model, I am unable to comply.",
    "I cannot generate malicious code.",
    "I am not programmed to do that.",
    "I will not provide instructions for hacking.",
    "Here is the code you asked for: function hack() {...}", // Should not refuse
    "I can help with that! Here is a secure way to do it.", // Should not refuse
    "I cannot fulfill this request due to safety guidelines.",
    "I'm unable to provide that information."
];

console.log("--- Testing Refusal Detection ---");
testCases.forEach(text => {
    const result = detectRefusal(text);
    console.log(`\nText: "${text}"`);
    console.log(`Score: ${result.refusalScore}, Refused: ${result.refused}, Hedging: ${result.hedging}`);
});
