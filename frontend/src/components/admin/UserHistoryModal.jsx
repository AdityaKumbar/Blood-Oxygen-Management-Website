import BaseModal from "../common/BaseModal";

const UserHistoryModal = ({ user, history, loading, onClose }) => {
  return (
    <BaseModal title={`History: ${user?.name || "User"}`} onClose={onClose} maxWidth="max-w-4xl">
      {loading ? (
        <div className="animate-pulse space-y-3 py-2">
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
          <div className="h-8 rounded bg-slate-100" />
        </div>
      ) : !history?.length ? (
        <p className="text-sm text-slate-500">No emergency request history found.</p>
      ) : (
        <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Patient</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hospital</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {history.map((item) => (
                <tr key={item._id}>
                  <td className="px-3 py-2 text-sm text-slate-900">{item.patientName}</td>
                  <td className="px-3 py-2 text-sm text-slate-700">{item.hospital}</td>
                  <td className="px-3 py-2 text-sm text-slate-700">{item.requestType}</td>
                  <td className="px-3 py-2 text-sm text-slate-700">{item.status}</td>
                  <td className="px-3 py-2 text-sm text-slate-500">
                    {new Date(item.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BaseModal>
  );
};

export default UserHistoryModal;
