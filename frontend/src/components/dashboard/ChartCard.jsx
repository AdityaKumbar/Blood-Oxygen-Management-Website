const ChartCard = ({ title, subtitle, children }) => {
  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.28)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Live
        </span>
      </div>
      <div className="h-72 w-full rounded-2xl bg-slate-50/80 p-2">
        {children}
      </div>
    </section>
  );
};

export default ChartCard;
