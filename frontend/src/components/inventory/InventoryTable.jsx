import EmptyState from "../common/EmptyState";

const statusBadgeStyles = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  LOW_STOCK: "bg-amber-100 text-amber-700",
  EXPIRED: "bg-rose-100 text-rose-700",
};

const InventoryTable = ({ rows, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="No blood inventory records" description="Add stock or adjust filters to view entries." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Blood Group</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Expiry Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Storage</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row._id}>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.bloodGroup}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.quantity}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{new Date(row.expiryDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.storageLocation}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeStyles[row.status] || statusBadgeStyles.AVAILABLE}`}>
                  {row.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <button onClick={() => onEdit(row)} className="mr-2 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50" type="button">Edit</button>
                <button onClick={() => onDelete(row)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-rose-700 hover:bg-rose-50" type="button">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
