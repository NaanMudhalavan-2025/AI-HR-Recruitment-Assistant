const TOOL_LABELS = {
  compute_skill_overlap: "skill overlap (deterministic)",
  compute_experience_fit: "experience fit (deterministic)",
  search_resume_evidence: "RAG search · resume",
  search_job_requirements: "RAG search · job description",
  submit_match_verdict: "final verdict submitted",
  submit_interview_kit: "interview kit submitted",
};

function summarizeOutput(tool, output) {
  if (!output) return "";
  if (tool === "search_resume_evidence" || tool === "search_job_requirements") {
    const n = output.snippets?.length || 0;
    return `${n} snippet${n === 1 ? "" : "s"} retrieved`;
  }
  if (tool === "compute_skill_overlap") {
    return `${output.must_have_coverage_pct ?? "?"}% must-have coverage`;
  }
  if (tool === "compute_experience_fit") {
    return output.fit || "";
  }
  return "done";
}

export default function AgentTraceLog({ steps = [], durationMs }) {
  if (!steps.length) {
    return <p className="text-sm text-muted">No agent run yet.</p>;
  }

  return (
    <div>
      <div className="trace-scroll max-h-72 overflow-y-auto font-mono text-[12.5px] leading-relaxed">
        {steps.map((step) => (
          <div key={step.step} className="flex gap-3 py-1.5 border-b border-hairline/60 last:border-0">
            <span className="text-faint w-5 text-right shrink-0">{step.step}</span>
            <div className="flex-1 min-w-0">
              <div className="text-ink">
                {TOOL_LABELS[step.tool] || step.tool}
                {step.input?.query ? (
                  <span className="text-muted"> — "{step.input.query}"</span>
                ) : null}
              </div>
              <div className="text-faint truncate">{summarizeOutput(step.tool, step.output)}</div>
            </div>
          </div>
        ))}
      </div>
      {durationMs != null && (
        <div className="mt-2 text-[11px] text-faint font-mono">
          completed in {(durationMs / 1000).toFixed(1)}s · {steps.length} tool call{steps.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  );
}
