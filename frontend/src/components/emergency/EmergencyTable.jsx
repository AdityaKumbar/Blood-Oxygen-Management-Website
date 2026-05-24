import EmptyState from "../common/EmptyState";

const priorityClass = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-rose-100 text-rose-700",
};

const statusClass = {
  PENDING: "bg-slate-100 text-slate-700",
  APPROVED: "bg-blue-100 text-blue-700",
  FORWARDED_TO_APP: "bg-amber-100 text-amber-700",
  REJECTED: "bg-rose-100 text-rose-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

const EmergencyTable = ({ rows, loading, onView }) => {
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
    return <EmptyState title="No emergency requests" description="Create a request or change your status filters." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Patient</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Details</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hospital</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Donor</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row._id}>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.patientName}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.requestType || "BLOOD"}</td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {(row.requestType || "BLOOD") === "OXYGEN" ? `${row.oxygenUnits || "-"} units` : row.bloodGroup || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.hospital}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass[row.priority] || priorityClass.MEDIUM}`}>
                  {row.priority}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[row.status] || statusClass.PENDING}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{row.assignedDonor || "-"}</td>
              <td className="px-4 py-3 text-right text-sm">
                <button type="button" onClick={() => onView(row)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmergencyTable;
