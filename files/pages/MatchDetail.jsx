import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import FilePanel from "../components/FilePanel.jsx";
import ScoreDial from "../components/ScoreDial.jsx";
import VerdictPill from "../components/VerdictPill.jsx";
import AgentTraceLog from "../components/AgentTraceLog.jsx";

const CATEGORY_LABEL = {
  technical: "Technical",
  behavioral: "Behavioral",
  gap_probing: "Probing a gap",
  role_specific: "Role-specific",
};

export default function MatchDetail() {
  const { jobId, candidateId } = useParams();
  const [job, setJob] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [match, setMatch] = useState(null);
  const [run, setRun] = useState(null);
  const [kit, setKit] = useState(null);
  const [kitRun, setKitRun] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [rematching, setRematching] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      api.getJob(jobId),
      api.getCandidate(candidateId),
      api.rankedCandidatesForJob(jobId),
      api.latestRun(jobId, candidateId, "match").catch(() => null),
      api.getInterviewKit(jobId, candidateId).catch(() => null),
      api.latestRun(jobId, candidateId, "interview_kit").catch(() => null),
    ]).then(([j, c, ranked, matchRun, interviewKit, interviewRun]) => {
      setJob(j);
      setCandidate(c);
      setMatch(ranked.find((m) => m.candidate_id === Number(candidateId)) || null);
      setRun(matchRun);
      setKit(interviewKit);
      setKitRun(interviewRun);
    }).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, candidateId]);

  const rerunMatch = async () => {
    setRematching(true);
    setError("");
    try {
      await api.runMatch(Number(jobId), Number(candidateId));
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRematching(false);
    }
  };

  const generateKit = async () => {
    setGenerating(true);
    setError("");
    try {
      await api.generateInterviewKit(Number(jobId), Number(candidateId));
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!job || !candidate) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm text-faint">
          <Link to={`/jobs/${jobId}`} className="hover:text-muted">{job.title}</Link>
          {" · "}
          <Link to={`/candidates/${candidateId}`} className="hover:text-muted">{candidate.name}</Link>
        </p>
        <h1 className="font-serif text-3xl text-ink mt-1">Match evaluation</h1>
      </header>

      {error && <p className="text-risk text-sm mb-4">{error}</p>}

      {!match ? (
        <FilePanel tab="no evaluation yet">
          <p className="text-sm text-muted mb-3">This pair hasn't been evaluated yet.</p>
          <button
            onClick={rerunMatch}
            disabled={rematching}
            className="px-3 py-2 rounded bg-accent text-base text-sm font-medium hover:brightness-110 disabled:opacity-50"
          >
            {rematching ? "Running agent…" : "Run match"}
          </button>
        </FilePanel>
      ) : (
        <>
          <FilePanel tab="verdict" className="mb-6">
            <div className="flex items-start gap-5">
              <ScoreDial score={match.score} verdict={match.verdict} size={92} />
              <div className="flex-1">
                <VerdictPill verdict={match.verdict} />
                <p className="text-sm text-ink mt-2 leading-relaxed">{match.rationale}</p>
              </div>
              <button
                onClick={rerunMatch}
                disabled={rematching}
                className="text-xs text-faint hover:text-muted disabled:opacity-50 shrink-0"
              >
                {rematching ? "running…" : "re-run"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-5">
              <div>
                <h3 className="text-xs font-mono text-faint mb-2">strengths</h3>
                <ul className="space-y-1.5 text-sm text-ink">
                  {match.strengths.map((s, i) => <li key={i}>· {s}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-mono text-faint mb-2">gaps</h3>
                <ul className="space-y-1.5 text-sm text-ink">
                  {match.gaps.map((g, i) => <li key={i}>· {g}</li>)}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-5">
              <div>
                <h3 className="text-xs font-mono text-faint mb-2">matched skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {match.matched_skills.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-goodSoft text-good">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-mono text-faint mb-2">missing skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {match.missing_skills.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-riskSoft text-risk">{s}</span>
                  ))}
                  {match.missing_skills.length === 0 && <span className="text-sm text-faint">None</span>}
                </div>
              </div>
            </div>
          </FilePanel>

          <FilePanel tab="agent trace · match" className="mb-6">
            <AgentTraceLog steps={run?.steps || []} durationMs={run?.duration_ms} />
          </FilePanel>

          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-ink">Interview kit</h2>
            <button
              onClick={generateKit}
              disabled={generating}
              className="px-3 py-2 rounded bg-accent text-base text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              {generating ? "Generating…" : kit ? "Regenerate kit" : "Generate interview kit"}
            </button>
          </div>

          {kit && (
            <>
              <FilePanel tab="focus areas" className="mb-6">
                <div className="flex flex-wrap gap-1.5">
                  {kit.focus_areas.map((f, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-accentSoft text-accent">{f}</span>
                  ))}
                </div>
              </FilePanel>

              <div className="space-y-3 mb-6">
                {kit.questions.map((q, i) => (
                  <FilePanel key={i} tab={CATEGORY_LABEL[q.category] || q.category}>
                    <p className="text-sm text-ink leading-relaxed">{q.question}</p>
                    <p className="text-xs text-faint mt-2">{q.why_it_matters}</p>
                  </FilePanel>
                ))}
              </div>

              <FilePanel tab="agent trace · interview kit">
                <AgentTraceLog steps={kitRun?.steps || []} durationMs={kitRun?.duration_ms} />
              </FilePanel>
            </>
          )}
        </>
      )}
    </div>
  );
}
