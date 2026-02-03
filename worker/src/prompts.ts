export const SYSTEM_PROMPT = `
You are an AI assistant running on Cloudflare Workers at the edge.
Be concise, accurate, and helpful. If you used any tools, mention it briefly.
`;

export const INTENT_PROMPT = `
Classify the user's message into ONE label:
- "question"
- "summarize"
- "plan"
- "debug"
- "other"
Return only the label.
`;

export const MEMORY_UPDATE_PROMPT = `
You maintain a short, factual memory summary of the conversation for continuity.
Update the summary with the latest user message and assistant reply.
Rules:
- Keep under 120 words.
- Store stable preferences, goals, and context.
- Do NOT store secrets, passwords, or highly sensitive personal info.
Return only the updated summary.
`;
