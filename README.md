# cf_ai_edge_agent

Cloudflare AI assignment: an edge-hosted chat app that demonstrates:
- LLM inference (Cloudflare Workers AI / Llama 3.3)
- workflow / coordination (multi-step agent pipeline orchestrated in a Durable Object)
- user chat interface (Cloudflare Pages)
- memory / state (Durable Object persistent storage)
- reproducible run + deploy instructions

## Architecture
Frontend (Cloudflare Pages) -> Worker API -> Durable Object (memory + workflow) -> Workers AI (LLM)

The Durable Object executes a deterministic workflow:
1) Load conversation state
2) Classify user intent
3) Optional tool step (time/math demo)
4) Generate reply via Workers AI
5) Persist history and update summary memory

## Local Dev
### Worker
cd worker
npm i
npx wrangler dev

### Frontend
cd ../frontend
npm i
npm run dev

Paste your worker URL into the UI and chat.

## Deploy
### Worker
cd worker
npx wrangler deploy

### Frontend (Pages)
cd frontend
npm run build
Deploy `frontend/dist` using Cloudflare Pages.

## Notes
- Memory/state is persisted in Durable Object storage.
- PROMPTS.md contains prompts used in this project (required by assignment).
