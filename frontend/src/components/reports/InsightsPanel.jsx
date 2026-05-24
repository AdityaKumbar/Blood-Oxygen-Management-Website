const InsightsPanel = ({ items }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Insights</h3>
      <p className="mt-1 text-xs text-slate-500">Actionable analytics for emergency operations planning</p>
      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default InsightsPanel;
