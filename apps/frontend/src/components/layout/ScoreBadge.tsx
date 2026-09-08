function ScoreBadge({ styles = '', score }: { styles?: string; score: number | string }) {
  return (
    <span className={`px-2 py-1 bg-green-600 rounded-sm text-white font-semibold ${styles}`}>
      <span className="sb-score__n" data-tier="high">
        {score}
      </span>
    </span>
  );
}

export default ScoreBadge;
