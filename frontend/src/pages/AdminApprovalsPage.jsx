import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

const AdminApprovalsPage = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPendingAccounts = async () => {
    try {
      setLoading(true);
      const data = await authService.listPendingUsers();
      setPendingAccounts(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch pending accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const handleApprove = async (id) => {
    try {
      setSaving(true);
      await authService.approvePendingUser(id);
      toast.success("Hospital account approved");
      fetchPendingAccounts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve account");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setSaving(true);
      await authService.rejectPendingUser(id, "Rejected by admin");
      toast.success("Hospital account rejected");
      fetchPendingAccounts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Hospital Approval Queue</h2>
            <p className="text-sm text-slate-600">Approve or reject hospitals before they can log in.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {pendingAccounts.length} pending
          </span>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3 py-4">
            <div className="h-10 rounded-lg bg-slate-100" />
            <div className="h-10 rounded-lg bg-slate-100" />
          </div>
        ) : pendingAccounts.length === 0 ? (
          <p className="text-sm text-slate-500">No pending hospital accounts.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hospital</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Requested At</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pendingAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{account.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{account.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(account.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(account.id)}
                          disabled={saving}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(account.id)}
                          disabled={saving}
                          className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-1.5 px-3 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminApprovalsPage;
