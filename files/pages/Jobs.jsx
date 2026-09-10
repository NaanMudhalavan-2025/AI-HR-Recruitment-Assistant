import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import FilePanel from "../components/FilePanel.jsx";

const EMPTY_FORM = {
  title: "",
  department: "",
  location: "",
  employment_type: "Full-time",
  seniority: "Mid",
  description: "",
  must_have_skills: "",
  nice_to_have_skills: "",
  min_experience_years: 0,
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.listJobs().then(setJobs).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.createJob({
        ...form,
        min_experience_years: Number(form.min_experience_years) || 0,
        must_have_skills: form.must_have_skills.split(",").map((s) => s.trim()).filter(Boolean),
        nice_to_have_skills: form.nice_to_have_skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Open roles</h1>
          <p className="text-muted mt-1">Each role is what candidates get matched against.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-2 rounded bg-accent text-base text-sm font-medium hover:brightness-110"
        >
          {showForm ? "Cancel" : "New role"}
        </button>
      </header>

      {error && <p className="text-risk text-sm mb-4">{error}</p>}

      {showForm && (
        <FilePanel tab="new role" className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Job title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
              />
              <input
                placeholder="Department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input"
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input"
              />
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Min. years experience"
                value={form.min_experience_years}
                onChange={(e) => setForm({ ...form, min_experience_years: e.target.value })}
                className="input"
              />
            </div>
            <textarea
              required
              placeholder="Job description"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input w-full"
            />
            <input
              placeholder="Must-have skills, comma separated (e.g. python, fastapi, postgresql)"
              value={form.must_have_skills}
              onChange={(e) => setForm({ ...form, must_have_skills: e.target.value })}
              className="input w-full"
            />
            <input
              placeholder="Nice-to-have skills, comma separated"
              value={form.nice_to_have_skills}
              onChange={(e) => setForm({ ...form, nice_to_have_skills: e.target.value })}
              className="input w-full"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 rounded bg-accent text-base text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create role"}
            </button>
          </form>
        </FilePanel>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <Link key={job.id} to={`/jobs/${job.id}`}>
            <FilePanel className="hover:border-faint transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-lg text-ink">{job.title}</h2>
                  <p className="text-sm text-muted mt-0.5">
                    {job.department || "—"} · {job.location || "—"} · {job.seniority}
                  </p>
                </div>
                <span className="text-xs text-faint font-mono">
                  {job.min_experience_years}+ yrs
                </span>
              </div>
              {job.must_have_skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.must_have_skills.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-raised text-muted">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </FilePanel>
          </Link>
        ))}
        {jobs.length === 0 && !showForm && (
          <p className="text-muted text-sm">No roles yet. Create one, or run the seed script.</p>
        )}
      </div>
    </div>
  );
}
