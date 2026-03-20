# Izuchukwu Obi — Personal AI Assistant

An enhanced AI assistant for your personal website with RAG, SQL knowledge base, evaluator pattern, and agentic tool use.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Gradio Chat UI                       │
└────────────────────────┬────────────────────────────────┘
                         │
                    ┌────▼─────┐
                    │  Me.chat │  (main agent entry point)
                    └────┬─────┘
                         │
          ┌──────────────▼──────────────┐
          │       RAG Search            │  ← ChromaDB vector store
          │  (semantic context lookup)  │     (6 knowledge chunks)
          └──────────────┬──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │    Gemini (chat model)      │  ← Agentic loop (up to 5 iters)
          │    + Tool calls             │
          └──────────────┬──────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐    ┌──────▼──────┐  ┌──────▼──────┐
   │ SQLite  │    │  Pushover   │  │  Portfolio  │
   │ Q&A DB  │    │ Lead Capture│  │  Projects   │
   └─────────┘    └─────────────┘  └─────────────┘
                         │
          ┌──────────────▼──────────────┐
          │  Groq Evaluator (llama-3.3) │  ← Fast evaluation pass
          │  Evaluation { is_acceptable,│
          │               feedback }    │
          └──────────────┬──────────────┘
                         │
              ┌──────────▼──────────┐
              │  Pass → return reply│
              │  Fail → rerun with  │
              │  feedback injected  │
              └─────────────────────┘
```

## Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create `.env`**
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   PUSHOVER_TOKEN=your_pushover_token   # optional
   PUSHOVER_USER=your_pushover_user     # optional
   ```

3. **Add your files** to `me/` folder:
   - `me/linkedin.pdf` — your LinkedIn export
   - `me/summary.txt` — your personal summary (auto-created if missing)

4. **Run**
   ```bash
   python me.py
   ```

## Features

### RAG Knowledge Base (ChromaDB)
- 6 semantic knowledge chunks about your background
- Query-time retrieval: relevant chunks are injected into each prompt
- Add more docs to `KNOWLEDGE_DOCS` list in `me.py`

### SQLite Q&A Database
- Pre-seeded with 10 common questions + answers about you
- Tool: `search_qa_database` — LLM searches it before answering
- Tool: `save_new_qa` — LLM can persist new Q&A pairs
- Tracks `frequency` and `last_asked` for analytics

### Evaluator Pattern (Groq)
- Every reply is evaluated by `llama-3.3-70b-versatile` via Groq
- Checks: accuracy, tone, in-character, no hallucination
- On failure: `rerun()` injects feedback into system prompt and retries

### Tools Available to LLM
| Tool | Purpose |
|------|---------|
| `record_user_details` | Capture email/name + Pushover alert |
| `record_unknown_question` | Log unanswerable questions |
| `search_qa_database` | Look up Q&A from SQLite |
| `save_new_qa` | Write new Q&A to SQLite |
| `get_portfolio_projects` | Return curated project list |

## Extending

**Add a new knowledge chunk:**
```python
KNOWLEDGE_DOCS.append({
    "id": "my_new_topic",
    "content": "Details about this topic...",
    "metadata": {"category": "technical"}
})
```

**Add a new tool:**
1. Write the Python function
2. Add JSON schema to `tools` list
3. Add to `TOOL_MAP`

**Add more projects:**
Edit the `get_portfolio_projects()` function.
