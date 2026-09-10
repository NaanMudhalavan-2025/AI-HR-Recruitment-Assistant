const VERDICT_COLOR = {
  strong_match: "#4FAE8E",
  possible_match: "#E3A542",
  weak_match: "#D9736B",
};

export default function ScoreDial({ score = 0, verdict = "possible_match", size = 76 }) {
  const color = VERDICT_COLOR[verdict] || "#E3A542";
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2E3440"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif text-lg text-ink">{Math.round(score)}</span>
      </div>
    </div>
  );
}
