export default function CategoryBreakdown({ expenses, total }) {
  if (total === 0) return null;

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  return (
    <section className="breakdown">
      <h3>Spending by category</h3>
      {Object.entries(byCategory).map(([cat, amt]) => {
        const pct = (amt / total) * 100;
        return (
          <div key={cat} className="bar-row">
            <span className="bar-label">{cat}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span>{pct.toFixed(0)}%</span>
          </div>
        );
      })}
    </section>
  );
}