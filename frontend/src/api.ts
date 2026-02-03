// frontend/src/api.ts
const DEFAULT_BASE_URL = "https://cf-ai-edge-agent-worker.tusharldh123-dff.workers.dev";

function getBaseUrl() {
  return localStorage.getItem("workerUrl") || DEFAULT_BASE_URL;
}

export async function sendMessage(sessionId: string, message: string) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  });

  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(json?.error || "Request failed");
    return json;
  } catch {
    throw new Error("Non-JSON response");
  }
}
