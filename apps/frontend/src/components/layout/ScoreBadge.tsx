const COLORS = [
  { from: 0, to: 2.9, color: 'oklch(57.7% 0.245 27.325)', tier: 'low' }, // red-600
  { from: 3, to: 3.9, color: 'oklch(64.6% 0.222 41.116)', tier: 'mid' }, // orange-600
  { from: 4, to: 4.4, color: 'oklch(68.1% 0.162 75.834)', tier: 'good' }, // yellow-600
  { from: 4.5, to: 5, color: 'oklch(62.7% 0.194 149.214)', tier: 'high' }, // green-600
];

function getScoreColor(score: number) {
  return COLORS.find((tier) => score >= tier.from && score <= tier.to) ?? COLORS[0];
}

function ScoreBadge({ styles = '', score }: { styles?: string; score: number | string }) {
  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  const { color, tier } = getScoreColor(numericScore);

  return (
    <span
      className={`px-2 py-1 rounded-sm text-white font-medium text-sm ${styles}`}
      style={{ backgroundColor:score==="NEW" ? 'purple': color }}
    >
      <span className="sb-score__n" data-tier={tier}>
        {score}
      </span>
    </span>
  );
}

export default ScoreBadge;
