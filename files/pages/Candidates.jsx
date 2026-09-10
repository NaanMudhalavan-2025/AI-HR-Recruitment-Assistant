import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import FilePanel from "../components/FilePanel.jsx";
import UploadDropzone from "../components/UploadDropzone.jsx";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.listCandidates().then(setCandidates).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file) => {
    setBusy(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.uploadResume(formData);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-ink">Candidate pool</h1>
        <p className="text-muted mt-1">Resumes are parsed once, then reused across every role.</p>
      </header>

      <FilePanel tab="add a candidate" className="mb-6">
        <UploadDropzone onFileSelected={handleUpload} busy={busy} />
        {error && <p className="text-risk text-sm mt-3">{error}</p>}
      </FilePanel>

      <div className="grid grid-cols-2 gap-3">
        {candidates.map((c) => (
          <Link key={c.id} to={`/candidates/${c.id}`}>
            <FilePanel className="hover:border-faint transition-colors h-full">
              <h2 className="font-serif text-lg text-ink">{c.name}</h2>
              <p className="text-sm text-muted mt-0.5">
                {c.experience_years} yrs · {c.email || "no email on file"}
              </p>
              {c.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.skills.slice(0, 6).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-raised text-muted">
                      {s}
                    </span>
                  ))}
                  {c.skills.length > 6 && (
                    <span className="text-xs px-2 py-0.5 text-faint">+{c.skills.length - 6} more</span>
                  )}
                </div>
              )}
            </FilePanel>
          </Link>
        ))}
        {candidates.length === 0 && (
          <p className="text-muted text-sm col-span-2">
            No candidates yet. Upload a resume above, or run the seed script.
          </p>
        )}
      </div>
    </div>
  );
}
