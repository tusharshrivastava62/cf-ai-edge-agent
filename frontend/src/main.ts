import "./style.css";
import { sendMessage, type ChatResponse } from "./api";

const SESSION_ID = "tushar";

function mustGetEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const app = mustGetEl<HTMLDivElement>("app");

app.innerHTML = `
  <div style="max-width:900px;margin:0 auto;padding:24px;font-family:system-ui;color:#fff;">
    <h1 style="margin:0 0 6px;">CF AI Edge Agent</h1>
    <div style="opacity:.8;margin-bottom:12px;">Ready</div>

    <div id="status" style="color:#ff8080;margin:8px 0 12px;"></div>

    <label style="display:block;margin:10px 0 6px;">Worker URL</label>
    <input id="workerUrl"
      style="width:100%;padding:10px;border-radius:8px;border:1px solid #333;background:#0b1220;color:#fff;"
      placeholder="https://YOUR-WORKER.your-subdomain.workers.dev" />

    <h2 style="margin:18px 0 8px;">Chat</h2>
    <div id="chat" style="min-height:140px;padding:12px;border-radius:12px;border:1px solid #333;background:#07101f;"></div>

    <div style="display:flex;gap:8px;margin-top:10px;">
      <input id="msg"
        style="flex:1;padding:10px;border-radius:8px;border:1px solid #333;background:#0b1220;color:#fff;"
        placeholder="Type a message..." />
      <button id="send"
        style="padding:10px 16px;border-radius:8px;border:1px solid #333;background:#1a2a55;color:#fff;cursor:pointer;">
        Send
      </button>
    </div>

    <h2 style="margin:22px 0 8px;">Memory Summary</h2>
    <div id="memory" style="white-space:pre-wrap;padding:12px;border-radius:12px;border:1px solid #333;background:#07101f;">
      No memory summary yet.
    </div>
  </div>
`;

const statusEl = mustGetEl<HTMLDivElement>("status");
const chatEl = mustGetEl<HTMLDivElement>("chat");
const memoryEl = mustGetEl<HTMLDivElement>("memory");
const workerUrlEl = mustGetEl<HTMLInputElement>("workerUrl");
const msgEl = mustGetEl<HTMLInputElement>("msg");
const sendBtn = mustGetEl<HTMLButtonElement>("send");

workerUrlEl.value = (localStorage.getItem("workerUrl") || "").trim();

type ChatLine = { who: "You" | "Assistant"; text: string };
const chat: ChatLine[] = [];

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function renderChat() {
  chatEl.innerHTML = chat
    .map(
      (m) => `
      <div style="margin:10px 0;">
        <div style="opacity:.75;font-size:12px;">${m.who}</div>
        <div style="white-space:pre-wrap;">${escapeHtml(m.text)}</div>
      </div>
    `
    )
    .join("");
}

function setStatus(msg: string) {
  statusEl.textContent = msg;
}

function setMemorySummary(ms?: string) {
  const val = (ms || "").trim();
  memoryEl.textContent =
    val || "No memory summary yet.\n\nThis updates when the worker returns memorySummary.";
}

async function onSend() {
  const baseUrl = workerUrlEl.value.trim();
  localStorage.setItem("workerUrl", baseUrl);

  const text = msgEl.value.trim();
  if (!text) return;

  setStatus("");
  msgEl.value = "";

  chat.push({ who: "You", text });
  chat.push({ who: "Assistant", text: "..." });
  renderChat();

  try {
    const data: ChatResponse = await sendMessage(SESSION_ID, text);
    chat.pop();
    chat.push({ who: "Assistant", text: String(data.reply ?? "(no reply)") });
    renderChat();
    setMemorySummary(data.memorySummary);
  } catch (e: any) {
    chat.pop();
    renderChat();
    setStatus(String(e?.message || e));
  }
}

sendBtn.addEventListener("click", () => void onSend());

msgEl.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") void onSend();
});

renderChat();
setMemorySummary();
