import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import EmergencyTable from "../components/emergency/EmergencyTable";
import EmergencyRequestModal from "../components/emergency/EmergencyRequestModal";
import Pagination from "../components/inventory/Pagination";
import { emergencyService } from "../services/emergencyService";
import { useRealtime } from "../context/RealtimeContext";

const initialForm = {
  patientName: "",
  requestType: "BLOOD",
  bloodGroup: "A+",
  oxygenUnits: "",
  hospital: "",
  priority: "MEDIUM",
  notes: "",
  isInventory: false,
};

const EmergencyRequestsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const { notifications } = useRealtime();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [donorName, setDonorName] = useState("");
  const [forwardNotes, setForwardNotes] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await emergencyService.list({ page, limit: 8, search, status, priority });
      setRows(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch emergency requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, status, priority]);

  // Auto-refresh when new emergency request is created via socket
  useEffect(() => {
    if (notifications?.length > 0) {
      const latestNotification = notifications[0];
      if (latestNotification.type === "new-emergency") {
        fetchData();
      }
    }
  }, [notifications]);

  const createRequest = async (event) => {
    event.preventDefault();
    if (!form.isInventory && (!form.patientName.trim() || !form.hospital.trim())) {
      setFormError("Patient name and hospital are required");
      return;
    }
    if (form.requestType === "OXYGEN" && (!Number.isFinite(Number(form.oxygenUnits)) || Number(form.oxygenUnits) <= 0)) {
      setFormError("Please enter valid oxygen units greater than 0");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      await emergencyService.create({
        patientName: form.isInventory ? "" : form.patientName.trim(),
        requestType: form.requestType,
        bloodGroup: form.requestType === "BLOOD" ? form.bloodGroup : undefined,
        oxygenUnits: form.requestType === "OXYGEN" ? Number(form.oxygenUnits) : undefined,
        hospital: form.isInventory ? "" : form.hospital.trim(),
        priority: form.isInventory ? "MEDIUM" : form.priority,
        notes: form.notes.trim(),
        isInventory: form.isInventory,
      });
      toast.success("Emergency request created");
      setForm(initialForm);
      fetchData();
    } catch (error) {
      setFormError(error?.response?.data?.message || "Unable to create request");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (actionFn, successMessage) => {
    if (!selectedRequest) return;
    try {
      setSaving(true);
      await actionFn();
      toast.success(successMessage);
      setSelectedRequest(null);
      setDonorName("");
      setForwardNotes("");
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Emergency Request Management</h2>
        <p className="mt-1 text-sm text-slate-600">Create, triage, assign, and resolve emergency blood and oxygen requests in one flow.</p>

        <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={createRequest}>
          <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-5 mb-1 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
            <input
              type="checkbox"
              id="isInventory"
              checked={form.isInventory}
              onChange={(e) => setForm((prev) => ({ ...prev, isInventory: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <label htmlFor="isInventory" className="text-sm font-semibold text-slate-800 cursor-pointer select-none">
              Request for Inventory <span className="font-normal text-slate-500">(No patient, hospital, or priority required - goes directly to app feed)</span>
            </label>
          </div>

          <input 
            className={`rounded-lg border px-3 py-2 text-sm transition-all duration-200 ${form.isInventory ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "border-slate-300 focus:border-rose-500"}`} 
            placeholder={form.isInventory ? "N/A (Inventory Request)" : "Patient name"} 
            value={form.isInventory ? "" : form.patientName} 
            onChange={(e) => setForm((prev) => ({ ...prev, patientName: e.target.value }))}
            disabled={form.isInventory} 
          />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 transition-all duration-200" value={form.requestType} onChange={(e) => setForm((prev) => ({ ...prev, requestType: e.target.value }))}>
            <option value="BLOOD">Blood</option>
            <option value="OXYGEN">Oxygen</option>
          </select>
          {form.requestType === "BLOOD" ? (
            <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 transition-all duration-200" value={form.bloodGroup} onChange={(e) => setForm((prev) => ({ ...prev, bloodGroup: e.target.value }))}>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => <option key={group} value={group}>{group}</option>)}
            </select>
          ) : (
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-500 transition-all duration-200" type="number" min="1" placeholder="Oxygen units needed" value={form.oxygenUnits} onChange={(e) => setForm((prev) => ({ ...prev, oxygenUnits: e.target.value }))} />
          )}
          <input 
            className={`rounded-lg border px-3 py-2 text-sm transition-all duration-200 ${form.isInventory ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "border-slate-300 focus:border-rose-500"}`} 
            placeholder={form.isInventory ? "N/A (Defaults to your bank)" : "Hospital"} 
            value={form.isInventory ? "" : form.hospital} 
            onChange={(e) => setForm((prev) => ({ ...prev, hospital: e.target.value }))}
            disabled={form.isInventory} 
          />
          <select 
            className={`rounded-lg border px-3 py-2 text-sm transition-all duration-200 ${form.isInventory ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "border-slate-300 focus:border-rose-500"}`} 
            value={form.isInventory ? "MEDIUM" : form.priority} 
            onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
            disabled={form.isInventory}
          >
            {form.isInventory ? (
              <option value="MEDIUM">MEDIUM (Default)</option>
            ) : (
              ['LOW','MEDIUM','HIGH','CRITICAL'].map((value) => <option key={value} value={value}>{value}</option>)
            )}
          </select>
          <button type="submit" disabled={saving} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-70 transition-all duration-200 shadow-sm shadow-rose-100">Create Request</button>
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2 lg:col-span-5 focus:border-rose-500 transition-all duration-200" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </form>
        {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search patient/hospital/donor"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="FORWARDED_TO_APP">Forwarded to App</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <select value={priority} onChange={(e) => { setPage(1); setPriority(e.target.value); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPriority("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <EmergencyTable rows={rows} loading={loading} onView={setSelectedRequest} />
      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />

      {selectedRequest && (
        <EmergencyRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => runAction(() => emergencyService.approve(selectedRequest._id), "Request approved")}
          onForwardToApp={() => runAction(() => emergencyService.forwardToApp(selectedRequest._id, forwardNotes), "Request forwarded to app queue")}
          onAssign={() => runAction(() => emergencyService.assignDonor(selectedRequest._id, donorName), "Donor assigned")}
          onResolve={() => runAction(() => emergencyService.resolve(selectedRequest._id), "Request resolved")}
          loading={saving}
          donorName={donorName}
          setDonorName={setDonorName}
          forwardNotes={forwardNotes}
          setForwardNotes={setForwardNotes}
          showActions={user?.role === "SUPER_ADMIN"}
        />
      )}
    </div>
  );
};

export default EmergencyRequestsPage;
