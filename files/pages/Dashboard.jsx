import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import FilePanel from "../components/FilePanel.jsx";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.listJobs(), api.listCandidates()])
      .then(([j, c]) => {
        setJobs(j);
        setCandidates(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Overview</h1>
        <p className="text-muted mt-1 max-w-xl">
          Screen resumes against a role, get a scored and reasoned verdict, then generate an
          interview kit built on top of it — with every step the agent took visible along the way.
        </p>
      </header>

      {error && <p className="text-risk text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-5 mb-8">
        <FilePanel tab="open roles">
          <div className="font-serif text-4xl text-ink">{jobs.length}</div>
          <Link to="/jobs" className="text-sm text-accent hover:underline mt-2 inline-block">
            View open roles
          </Link>
        </FilePanel>
        <FilePanel tab="candidate pool">
          <div className="font-serif text-4xl text-ink">{candidates.length}</div>
          <Link to="/candidates" className="text-sm text-accent hover:underline mt-2 inline-block">
            View candidate pool
          </Link>
        </FilePanel>
      </div>

      <FilePanel tab="how it works">
        <ol className="space-y-3 text-sm text-muted">
          <li>
            <span className="text-ink">1. Post a role</span> — must-have skills, nice-to-have
            skills, and a minimum experience bar.
          </li>
          <li>
            <span className="text-ink">2. Upload resumes</span> — parsed into structured fields
            and indexed for retrieval.
          </li>
          <li>
            <span className="text-ink">3. Run the match</span> — the agent calls deterministic
            scoring tools and searches both documents for evidence before it commits to a verdict.
          </li>
          <li>
            <span className="text-ink">4. Generate an interview kit</span> — grounded in the
            specific gaps the match surfaced.
          </li>
        </ol>
      </FilePanel>
    </div>
  );
}
