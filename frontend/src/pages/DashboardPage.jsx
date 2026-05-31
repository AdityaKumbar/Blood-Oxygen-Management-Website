import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import { useRealtime } from "../context/RealtimeContext";
import { emergencyService } from "../services/emergencyService";
import { authService } from "../services/authService";
import EmergencyRequestModal from "../components/emergency/EmergencyRequestModal";
import { ROLES } from "../utils/roles";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const { notifications } = useRealtime();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donorName, setDonorName] = useState("");
  const [forwardNotes, setForwardNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [pendingAccountsLoading, setPendingAccountsLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === ROLES.SUPER_ADMIN;

  const fetchPendingRequests = async () => {
    try {
      setRequestsLoading(true);
      const data = await emergencyService.list({ status: "PENDING", limit: 50 });
      setPendingRequests(data.items || []);
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchPendingAccounts = async () => {
    if (!isAdmin) return;
    try {
      setPendingAccountsLoading(true);
      const data = await authService.listPendingUsers();
      setPendingAccounts(data || []);
    } catch (error) {
      console.error("Failed to fetch pending accounts:", error);
    } finally {
      setPendingAccountsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    if (isAdmin) {
      fetchPendingAccounts();
    }
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [isAdmin]);

  useEffect(() => {
    if (notifications?.length > 0) {
      const latest = notifications[0];
      if (latest.type === "new-emergency" || latest.type === "request-approved") {
        fetchPendingRequests();
      }
    }
  }, [notifications]);

  const handleApprove = async (id) => {
    try {
      setSaving(true);
      await emergencyService.approve(id);
      toast.success("Emergency request approved successfully");
      fetchPendingRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve request");
    } finally {
      setSaving(false);
    }
  };

  const handleForwardToApp = async (id, notes = "Forwarded to app due to unavailable stock") => {
    try {
      setSaving(true);
      await emergencyService.forwardToApp(id, notes);
      toast.success("Emergency request forwarded to app queue");
      fetchPendingRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to forward request");
    } finally {
      setSaving(false);
    }
  };

  const runModalAction = async (actionFn, successMsg) => {
    if (!selectedRequest) return;
    try {
      setSaving(true);
      await actionFn();
      toast.success(successMsg);
      setSelectedRequest(null);
      setDonorName("");
      setForwardNotes("");
      fetchPendingRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAccount = async (id) => {
    try {
      setSaving(true);
      await authService.approvePendingUser(id);
      toast.success("Account approved successfully");
      fetchPendingAccounts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve account");
    } finally {
      setSaving(false);
    }
  };

  const handleRejectAccount = async (id) => {
    try {
      setSaving(true);
      await authService.rejectPendingUser(id, "Rejected by admin");
      toast.success("Account rejected successfully");
      fetchPendingAccounts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-26px_rgba(15,23,42,0.35)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Operations</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Admin Dashboard</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">Manage live pending emergency requests and account approvals.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pending Requests</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{pendingRequests.length}</p>
                </div>
              </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Pending Emergency Requests</h3>
            </div>
            <p className="text-xs text-slate-500">Urgent requests raised by hospitals awaiting administrator review.</p>
          </div>
          {pendingRequests.length > 0 && (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">{pendingRequests.length} pending</span>
          )}
        </div>

        {requestsLoading ? (
          <div className="animate-pulse space-y-3 py-4">
            <div className="h-10 rounded-lg bg-slate-100" />
            <div className="h-10 rounded-lg bg-slate-100" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <p className="text-sm text-slate-500">No pending emergency requests.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Patient</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Details</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Hospital</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Priority</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Date/Time</th>
                  <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pendingRequests.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.patientName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.requestType || "BLOOD"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{(row.requestType || "BLOOD") === "OXYGEN" ? `${row.oxygenUnits || "-"} units` : row.bloodGroup || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.hospital}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.priority === "CRITICAL"
                          ? "bg-rose-100 text-rose-700"
                          : row.priority === "HIGH"
                            ? "bg-orange-100 text-orange-700"
                            : row.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                      }`}>
                        {row.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(row.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => handleApprove(row._id)}
                              disabled={saving}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleForwardToApp(row._id)}
                              disabled={saving}
                              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-1.5 px-3 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Forward to App
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic self-center mr-2">View Only</span>
                        )}
                        <button
                          onClick={() => setSelectedRequest(row)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Details
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

          {isAdmin && (
            <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.28)] sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pending Hospital & Donor Accounts</h3>
              <p className="text-xs text-slate-500">Approve or reject account requests before they can log in.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{pendingAccounts.length} pending</span>
          </div>

          {pendingAccountsLoading ? (
            <div className="animate-pulse space-y-3 py-4">
              <div className="h-10 rounded-lg bg-slate-100" />
              <div className="h-10 rounded-lg bg-slate-100" />
            </div>
          ) : pendingAccounts.length === 0 ? (
            <p className="text-sm text-slate-500">No pending account requests.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Email</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Role</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Requested At</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pendingAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{account.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{account.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{account.role}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{new Date(account.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApproveAccount(account.id)}
                            disabled={saving}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 px-3 transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAccount(account.id)}
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
          )}
        </>
      )}
      {selectedRequest && (
        <EmergencyRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => runModalAction(() => emergencyService.approve(selectedRequest._id), "Request approved")}
          onForwardToApp={() => runModalAction(() => emergencyService.forwardToApp(selectedRequest._id, forwardNotes), "Request forwarded to app queue")}
          onAssign={() => runModalAction(() => emergencyService.assignDonor(selectedRequest._id, donorName), "Donor assigned")}
          onResolve={() => runModalAction(() => emergencyService.resolve(selectedRequest._id), "Request resolved")}
          loading={saving}
          donorName={donorName}
          setDonorName={setDonorName}
          forwardNotes={forwardNotes}
          setForwardNotes={setForwardNotes}
          showActions={isAdmin}
        />
      )}
    </div>
  );
};

export default DashboardPage;
