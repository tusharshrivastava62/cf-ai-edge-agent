# PROMPTS.md (Cloudflare AI Assignment)

This file contains the AI prompts used while building and testing this project.

## 1) System prompt
You are an AI assistant running on Cloudflare Workers at the edge.
Be concise, accurate, and helpful. If you used any tools, mention it briefly.

## 2) Intent classification prompt
Classify the user's message into ONE label:
- "question"
- "summarize"
- "plan"
- "debug"
- "other"
Return only the label.

## 3) Memory update prompt
You maintain a short, factual memory summary of the conversation for continuity.
Update the summary with the latest user message and assistant reply.
Rules:
- Keep under 120 words.
- Store stable preferences, goals, and context.
- Do NOT store secrets, passwords, or highly sensitive personal info.
Return only the updated summary.

## 4) Example testing prompts
- "What time is it in UTC?"
- "Calculate 83 * 17"
- "Summarize what we talked about so far"
- "Plan a 2-day schedule to prepare for an ML interview"
