import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import FilePanel from "../components/FilePanel.jsx";
import ScoreDial from "../components/ScoreDial.jsx";
import VerdictPill from "../components/VerdictPill.jsx";

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      api.getCandidate(candidateId),
      api.listJobs(),
      api.matchesForCandidate(candidateId).catch(() => []),
    ]).then(([c, j, m]) => {
      setCandidate(c);
      setJobs(j);
      setMatches(m);
    }).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const matchedJobIds = new Set(matches.map((m) => m.job_id));
  const unmatchedJobs = jobs.filter((j) => !matchedJobIds.has(j.id));

  const runMatch = async (jobId) => {
    setMatching(true);
    setError("");
    try {
      await api.runMatch(jobId, Number(candidateId));
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMatching(false);
    }
  };

  if (!candidate) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink">{candidate.name}</h1>
        <p className="text-muted mt-1">
          {candidate.experience_years} yrs experience
          {candidate.email && ` · ${candidate.email}`}
          {candidate.phone && ` · ${candidate.phone}`}
        </p>
      </header>

      {error && <p className="text-risk text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-2 gap-5 mb-6">
        <FilePanel tab="skills">
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded bg-raised text-muted">
                {s}
              </span>
            ))}
            {candidate.skills.length === 0 && <p className="text-sm text-faint">None detected.</p>}
          </div>
        </FilePanel>
        <FilePanel tab="education">
          {candidate.education.length > 0 ? (
            <ul className="text-sm text-ink space-y-1">
              {candidate.education.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-faint">None detected.</p>
          )}
        </FilePanel>
      </div>

      <FilePanel tab={candidate.resume_filename || "resume text"} className="mb-8">
        <pre className="text-sm text-muted whitespace-pre-wrap font-sans max-h-64 overflow-y-auto trace-scroll">
          {candidate.resume_text}
        </pre>
      </FilePanel>

      <h2 className="font-serif text-xl text-ink mb-3">Matches</h2>
      <div className="space-y-3 mb-6">
        {matches.map((m) => (
          <Link key={m.id} to={`/jobs/${m.job_id}/candidates/${candidateId}`}>
            <FilePanel className="hover:border-faint transition-colors flex items-center gap-4">
              <ScoreDial score={m.score} verdict={m.verdict} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-ink">{m.job.title}</h3>
                  <VerdictPill verdict={m.verdict} />
                </div>
                <p className="text-sm text-muted mt-1 line-clamp-2">{m.rationale}</p>
              </div>
            </FilePanel>
          </Link>
        ))}
        {matches.length === 0 && <p className="text-muted text-sm">Not matched against any role yet.</p>}
      </div>

      {unmatchedJobs.length > 0 && (
        <>
          <h2 className="font-serif text-xl text-ink mb-3">Try against another role</h2>
          <div className="space-y-2">
            {unmatchedJobs.map((j) => (
              <FilePanel key={j.id} className="flex items-center justify-between">
                <span className="text-ink">{j.title}</span>
                <button
                  onClick={() => runMatch(j.id)}
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
