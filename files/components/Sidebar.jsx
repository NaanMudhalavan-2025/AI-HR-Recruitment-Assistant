import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Overview", end: true },
  { to: "/jobs", label: "Open roles" },
  { to: "/candidates", label: "Candidate pool" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-hairline bg-surface flex flex-col">
      <div className="px-5 py-5 border-b border-hairline">
        <div className="font-serif text-lg text-ink leading-tight">Fieldnote</div>
        <div className="text-[11px] text-faint font-mono mt-0.5">recruiting copilot</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? "bg-raised text-accent border-l-2 border-accent -ml-px pl-[11px]"
                  : "text-muted hover:text-ink hover:bg-raised/60"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-hairline text-[11px] text-faint leading-relaxed">
        Agent + Tools + RAG
        <br />
        every verdict is traceable
      </div>
    </aside>
  );
}
