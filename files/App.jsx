import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Candidates from "./pages/Candidates.jsx";
import CandidateDetail from "./pages/CandidateDetail.jsx";
import MatchDetail from "./pages/MatchDetail.jsx";

export default function App() {
  return (
    <div className="flex h-screen bg-base text-ink">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:candidateId" element={<CandidateDetail />} />
            <Route path="/jobs/:jobId/candidates/:candidateId" element={<MatchDetail />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
