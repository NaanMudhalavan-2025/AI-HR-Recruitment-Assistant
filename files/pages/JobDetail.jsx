import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import FilePanel from "../components/FilePanel.jsx";
import ScoreDial from "../components/ScoreDial.jsx";
import VerdictPill from "../components/VerdictPill.jsx";

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      api.getJob(jobId),
      api.listCandidates(),
      api.rankedCandidatesForJob(jobId).catch(() => []),
    ]).then(([j, c, m]) => {
      setJob(j);
      setCandidates(c);
      setMatches(m);
    }).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const matchedIds = new Set(matches.map((m) => m.candidate_id));
  const unmatched = candidates.filter((c) => !matchedIds.has(c.id));

  const runBulkMatch = async () => {
    setMatching(true);
    setError("");
    try {
      await api.runBulkMatch(Number(jobId));
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMatching(false);
    }
  };

  const runSingleMatch = async (candidateId) => {
    setMatching(true);
    setError("");
    try {
      await api.runMatch(Number(jobId), candidateId);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMatching(false);
    }
  };

  if (!job) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink">{job.title}</h1>
        <p className="text-muted mt-1">
          {job.department || "—"} · {job.location || "—"} · {job.seniority} · {job.min_experience_years}+ yrs
        </p>
      </header>

      {error && <p className="text-risk text-sm mb-4">{error}</p>}

      <FilePanel tab="job description" className="mb-6">
        <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{job.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-faint">Must-have: </span>
            {job.must_have_skills.map((s) => (
              <span key={s} className="text-ink mr-2">{s}</span>
            ))}
          </div>
        </div>
        {job.nice_to_have_skills.length > 0 && (
          <div className="mt-1 text-sm">
            <span className="text-faint">Nice-to-have: </span>
            {job.nice_to_have_skills.map((s) => (
              <span key={s} className="text-muted mr-2">{s}</span>
            ))}
          </div>
        )}
      </FilePanel>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-xl text-ink">Ranked candidates</h2>
        {unmatched.length > 0 && (
          <button
            onClick={runBulkMatch}
            disabled={matching}
            className="px-3 py-2 rounded bg-accent text-base text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            {matching ? "Running agent…" : `Match ${unmatched.length} unscored candidate${unmatched.length === 1 ? "" : "s"}`}
          </button>
        )}
      </div>

      <div className="space-y-3 mb-8">
        {matches.map((m) => (
          <Link key={m.id} to={`/jobs/${jobId}/candidates/${m.candidate_id}`}>
            <FilePanel className="hover:border-faint transition-colors flex items-center gap-4">
              <ScoreDial score={m.score} verdict={m.verdict} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-ink">{m.candidate.name}</h3>
                  <VerdictPill verdict={m.verdict} />
                </div>
                <p className="text-sm text-muted mt-1 line-clamp-2">{m.rationale}</p>
              </div>
            </FilePanel>
          </Link>
        ))}
        {matches.length === 0 && (
          <p className="text-muted text-sm">No candidates matched against this role yet.</p>
        )}
      </div>

      {unmatched.length > 0 && (
        <>
          <h2 className="font-serif text-xl text-ink mb-3">Not yet scored</h2>
          <div className="space-y-2">
            {unmatched.map((c) => (
              <FilePanel key={c.id} className="flex items-center justify-between">
                <div>
                  <span className="text-ink">{c.name}</span>
                  <span className="text-muted text-sm ml-2">{c.experience_years} yrs</span>
                </div>
                <button
                  onClick={() => runSingleMatch(c.id)}
                  disabled={matching}
                  className="text-sm text-accent hover:underline disabled:opacity-50"
                >
                  Run match
                </button>
              </FilePanel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
