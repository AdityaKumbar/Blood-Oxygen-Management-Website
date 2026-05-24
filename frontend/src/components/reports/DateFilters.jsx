const DateFilters = ({ range, onChange }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">From</span>
          <input
            type="date"
            value={range.from}
            onChange={(e) => onChange((prev) => ({ ...prev, from: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">To</span>
          <input
            type="date"
            value={range.to}
            onChange={(e) => onChange((prev) => ({ ...prev, to: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => onChange({ from: "2026-01-01", to: "2026-12-31" })}
          className="self-end rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          Reset Range
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">Export-ready structure: attach CSV/PDF export actions to this date filter state.</p>
    </section>
  );
};

export default DateFilters;
