const STYLES = {
  strong_match: { label: "Strong match", bg: "bg-goodSoft", text: "text-good" },
  possible_match: { label: "Possible match", bg: "bg-accentSoft", text: "text-accent" },
  weak_match: { label: "Weak match", bg: "bg-riskSoft", text: "text-risk" },
};

export default function VerdictPill({ verdict }) {
  const style = STYLES[verdict] || STYLES.possible_match;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
