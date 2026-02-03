export function renderApp(root: HTMLElement) {
  root.innerHTML = `
    <div class="wrap">
      <h1>cf_ai_edge_agent</h1>
      <p class="sub">Chat + workflow + durable memory (Cloudflare Workers AI)</p>

      <label>Worker URL</label>
      <input id="workerUrl" placeholder="https://YOUR-WORKER.your-subdomain.workers.dev" />

      <div id="log" class="log"></div>

      <div class="row">
        <input id="msg" placeholder="Type a message..." />
        <button id="send">Send</button>
      </div>

      <details class="mem">
        <summary>Memory summary</summary>
        <pre id="mem"></pre>
      </details>

      <details class="steps">
        <summary>Workflow steps</summary>
        <pre id="steps"></pre>
      </details>
    </div>
  `;
}

export function appendLog(el: HTMLElement, who: string, text: string) {
  const div = document.createElement("div");
  div.className = "bubble";
  div.innerHTML = `<b>${who}:</b> ${escapeHtml(text)}`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c] as string));
}
