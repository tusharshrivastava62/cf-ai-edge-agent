// worker/src/index.ts
import { ChatSessionDO, type ChatMsg } from "./session_do";

export interface Env {
  AI: any;
  CHAT_SESSION: DurableObjectNamespace;
}

const MODEL = "@cf/meta/llama-3.1-8b-instruct";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

async function runModel(ai: any, messages: ChatMsg[]) {
  const out = await ai.run(MODEL, { messages });
  const text =
    (out?.response ?? out?.result ?? out?.output_text ?? out?.text ?? "").toString().trim();
  return text || "Sorry — I couldn't generate a response.";
}

async function makeMemorySummary(ai: any, history: ChatMsg[]) {
  // Summarize only last ~20 messages so it’s fast/cheap
  const last = history.slice(-20);

  const prompt: ChatMsg[] = [
    {
      role: "system",
      content:
        "Summarize the user's stable facts/preferences in 1-3 bullet points. " +
        "Only include durable info worth remembering. If nothing, return an empty string.",
    },
    {
      role: "user",
      content:
        "Conversation:\n" +
        last.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n"),
    },
  ];

  const summary = await runModel(ai, prompt);

  // If the model gives something useless, allow empty
  const cleaned = summary.trim();
  if (!cleaned) return "";

  // Optional: if it responds with “nothing to remember” treat as empty
  const lower = cleaned.toLowerCase();
  if (lower.includes("nothing") && lower.includes("remember")) return "";

  return cleaned;
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });

    const url = new URL(request.url);

    // health
    if (url.pathname === "/") return new Response("OK", { headers: corsHeaders() });

    // POST /chat
    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const body = (await request.json()) as { sessionId?: string; message?: string };
        const sessionId = String(body.sessionId ?? "default");
        const userMessage = String(body.message ?? "").trim();
        if (!userMessage) return json({ ok: false, error: "message is required" }, 400);

        // Per-session DO
        const id = env.CHAT_SESSION.idFromName(sessionId);
        const stub = env.CHAT_SESSION.get(id);

        // Load current memory
        const memRes = await stub.fetch("https://do/do/memory");
        const memJson = (await memRes.json()) as { history: ChatMsg[]; memorySummary: string };
        const history: ChatMsg[] = Array.isArray(memJson.history) ? memJson.history : [];
        let memorySummary: string = typeof memJson.memorySummary === "string" ? memJson.memorySummary : "";

        // Append user message
        await stub.fetch("https://do/do/append", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content: userMessage }),
        });

        // Build model messages: include memory summary if present + recent history
        const modelMessages: ChatMsg[] = [];

        modelMessages.push({
          role: "system",
          content:
            "You are a helpful assistant. Be clear and practical. " +
            (memorySummary ? `\nKnown user memory:\n${memorySummary}\n` : ""),
        });

        // Use last 12 messages from history (plus user msg already added)
        const updatedMemRes = await stub.fetch("https://do/do/memory");
        const updated = (await updatedMemRes.json()) as { history: ChatMsg[]; memorySummary: string };
        const updatedHistory = Array.isArray(updated.history) ? updated.history : [];
        const recent = updatedHistory.slice(-12);

        modelMessages.push(...recent);

        // Run model for assistant reply
        const reply = await runModel(env.AI, modelMessages);

        // Append assistant reply
        await stub.fetch("https://do/do/append", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "assistant", content: reply }),
        });

        // Recompute summary occasionally (every message is fine for MVP)
        const afterRes = await stub.fetch("https://do/do/memory");
        const after = (await afterRes.json()) as { history: ChatMsg[]; memorySummary: string };
        const afterHistory = Array.isArray(after.history) ? after.history : [];

        const newSummary = await makeMemorySummary(env.AI, afterHistory);
        memorySummary = newSummary;

        await stub.fetch("https://do/do/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memorySummary }),
        });

        return json({ ok: true, reply, memorySummary });
      } catch (e: any) {
        return json({ ok: false, error: e?.message || String(e) }, 500);
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders() });
  },
} satisfies ExportedHandler<Env>;

// Needed so Wrangler sees the class
export { ChatSessionDO };
