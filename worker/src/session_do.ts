// worker/src/session_do.ts
export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export class ChatSessionDO {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // GET /do/memory  -> returns { history, memorySummary }
    if (url.pathname === "/do/memory") {
      const history = (await this.state.storage.get<ChatMsg[]>("history")) || [];
      const memorySummary = (await this.state.storage.get<string>("memorySummary")) || "";
      return Response.json({ history, memorySummary });
    }

    // POST /do/append -> body: { role, content }
    if (url.pathname === "/do/append" && request.method === "POST") {
      const body = (await request.json()) as { role: ChatMsg["role"]; content: string };

      const history = (await this.state.storage.get<ChatMsg[]>("history")) || [];
      history.push({ role: body.role, content: body.content });
      await this.state.storage.put("history", history.slice(-30)); // keep last 30

      return Response.json({ ok: true });
    }

    // POST /do/summary -> body: { memorySummary }
    if (url.pathname === "/do/summary" && request.method === "POST") {
      const body = (await request.json()) as { memorySummary: string };
      await this.state.storage.put("memorySummary", body.memorySummary || "");
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  }
}
