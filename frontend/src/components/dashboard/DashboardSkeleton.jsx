const DashboardSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-96 rounded-2xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
      <div className="h-72 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );
};

export default DashboardSkeleton;
