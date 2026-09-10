# Fieldnote — AI HR Recruitment Copilot

Screens resumes, matches candidates against job descriptions, and generates
interview questions — built as an **Agent + Tools + RAG** system rather than
a single prompt-and-hope call to an LLM.

## Why it's built this way

A single LLM call given a resume and a job description will happily produce
a plausible-sounding score, but it can't show its work and it can quietly
hallucinate a skill match that isn't there. This project instead gives
Claude a small toolbox and makes it use it:

- **Deterministic tools** (`compute_skill_overlap`, `compute_experience_fit`)
  do the parts of the job that have one right answer in plain Python — no
  LLM involved, so the numbers are the same every time.
- **RAG tools** (`search_resume_evidence`, `search_job_requirements`) let the
  agent pull grounded snippets from the actual documents before it claims a
  strength or a gap, instead of inventing detail from a summary.
- **A structured "submit" tool** (`submit_match_verdict` /
  `submit_interview_kit`) is how the agent hands back its final answer, so
  the output is parsed as structured data rather than scraped out of free text.
- **Every tool call is logged** to an `AgentRun` trace and shown in the UI,
  so a recruiter can see exactly what the agent looked at before it decided
  anything.

## Project layout

```
ai-hr-recruitment/
├── backend/                 FastAPI + SQLAlchemy + Anthropic SDK
│   └── app/
│       ├── agent/           tool specs, prompts, and the tool-use loop
│       ├── rag/             text extraction, chunking, TF-IDF retrieval
│       ├── routers/         jobs, candidates, matching, interview
│       ├── models.py        Job, Candidate, MatchResult, InterviewKit, AgentRun
│       └── seed_data.py     demo jobs + candidates
└── frontend/                React + Vite + Tailwind
    └── src/
        ├── pages/           Dashboard, Jobs, Candidates, JobDetail,
        │                    CandidateDetail, MatchDetail
        └── components/      Sidebar, ScoreDial, AgentTraceLog, FilePanel...
```

## Running it

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # then add your ANTHROPIC_API_KEY
python -m app.seed_data                                # loads 3 jobs + 6 candidates
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).
SQLite is the default database — no setup needed. To use Postgres instead,
set `DATABASE_URL` in `.env` to a `postgresql+psycopg2://...` connection
string and re-run the seed script.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. If your backend runs somewhere other than
`localhost:8000`, set `VITE_API_URL` in a `frontend/.env` file.

### 3. Try it

1. Open a job (the seed data includes a Backend Engineer, Frontend Engineer,
   and Data Analyst role).
2. Click **"Match unscored candidates"** — the agent runs once per candidate
   and you'll see a scored, reasoned verdict for each.
3. Open a scored match and click **"Generate interview kit"** — it builds
   questions grounded in the specific gaps that match surfaced.
4. Expand the **agent trace** panels on either page to see the tool calls
   behind the result.

## Scaling the RAG layer

The retrieval layer is deliberately the simplest thing that could work: it
fits a TF-IDF vectorizer per document collection and ranks chunks by cosine
similarity — no model download, no vector database, no network dependency
at runtime. `app/rag/vector_store.py` is the only file that would need to
change to swap in real embeddings (e.g. `sentence-transformers`) and a
proper vector index (e.g. pgvector on the same Postgres instance) — every
other file calls `retriever.search_resume` / `retriever.search_job` and
doesn't know or care how the ranking happens underneath.

## Notes

- Resume parsing (`app/rag/text_extraction.py`) is heuristic (regex +
  keyword matching for email/phone/experience/skills). It's a reasonable
  first pass and a real deployment would likely add a dedicated resume
  parsing tool or model here — the agent's own RAG search over the raw
  resume text is what actually grounds the final verdict, so this heuristic
  layer only has to be "good enough," not perfect.
- `AGENT_MODEL` in `.env` defaults to `claude-sonnet-5`; any current Claude
  model with tool use works.
