const COLORS = [
  { from: 0, to: 2.9, color: "oklch(57.7% 0.245 27.325)", tier: "low" }, // red-600
  { from: 3, to: 3.9, color: "oklch(64.6% 0.222 41.116)", tier: "mid" }, // orange-600
  { from: 4, to: 4.4, color: "oklch(68.1% 0.162 75.834)", tier: "good" }, // yellow-600
  { from: 4.5, to: 5, color: "oklch(62.7% 0.194 149.214)", tier: "high" }, // green-600
];

function getScoreColor(score: number) {
  return COLORS.find((tier) => score >= tier.from && score <= tier.to) ?? COLORS[0];
}

function ScoreBadge({ styles = "", score }: { styles?: string; score: number | null }) {
  if (score == null) {
    return (
      <span
        className={`rounded-sm px-2 py-1 text-sm font-medium text-white ${styles}`}
        style={{ backgroundColor: "purple" }}
      >
        <span className="sb-score__n">{"NEW"}</span>
      </span>
    );
  }
  const { color, tier } = getScoreColor(score);

  return (
    <span
      className={`rounded-sm px-2 py-1 text-sm font-medium text-white ${styles}`}
      style={{ backgroundColor: color }}
    >
      <span className="sb-score__n" data-tier={tier}>
        {score.toFixed(1)}
      </span>
    </span>
  );
}

export default ScoreBadge;
