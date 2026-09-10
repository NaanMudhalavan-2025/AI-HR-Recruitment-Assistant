const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* no JSON body */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Jobs
  listJobs: () => request("/api/jobs"),
  getJob: (id) => request(`/api/jobs/${id}`),
  createJob: (data) => request("/api/jobs", { method: "POST", body: JSON.stringify(data) }),
  deleteJob: (id) => request(`/api/jobs/${id}`, { method: "DELETE" }),

  // Candidates
  listCandidates: () => request("/api/candidates"),
  getCandidate: (id) => request(`/api/candidates/${id}`),
  uploadResume: (formData) => request("/api/candidates/upload", { method: "POST", body: formData }),
  deleteCandidate: (id) => request(`/api/candidates/${id}`, { method: "DELETE" }),

  // Matching
  runMatch: (job_id, candidate_id) =>
    request("/api/matching/run", { method: "POST", body: JSON.stringify({ job_id, candidate_id }) }),
  runBulkMatch: (job_id, candidate_ids) =>
    request("/api/matching/run-bulk", { method: "POST", body: JSON.stringify({ job_id, candidate_ids }) }),
  rankedCandidatesForJob: (job_id) => request(`/api/matching/jobs/${job_id}/ranked`),
  matchesForCandidate: (candidate_id) => request(`/api/matching/candidates/${candidate_id}/matches`),
  latestRun: (job_id, candidate_id, run_type = "match") =>
    request(`/api/matching/jobs/${job_id}/candidates/${candidate_id}/latest-run?run_type=${run_type}`),

  // Interview kits
  generateInterviewKit: (job_id, candidate_id, num_questions = 8) =>
    request("/api/interview/generate", {
      method: "POST",
      body: JSON.stringify({ job_id, candidate_id, num_questions }),
    }),
  getInterviewKit: (job_id, candidate_id) => request(`/api/interview/jobs/${job_id}/candidates/${candidate_id}`),
};
