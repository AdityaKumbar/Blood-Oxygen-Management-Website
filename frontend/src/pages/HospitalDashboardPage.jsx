import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { bloodService } from "../services/bloodService";
import { oxygenService } from "../services/oxygenService";
import { emergencyService } from "../services/emergencyService";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const initialForm = {
  patientName: "",
  requestType: "BLOOD",
  bloodGroup: "A+",
  oxygenUnits: "",
  hospital: "",
  priority: "MEDIUM",
  notes: "",
};

const HospitalDashboardPage = () => {
  const user = useSelector((state) => state.auth.user);
  const hospitalName = user?.name?.trim() || "";
  const [bloodRows, setBloodRows] = useState([]);
  const [oxygenRows, setOxygenRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...initialForm, hospital: hospitalName });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!hospitalName) return;
    setForm((prev) => ({ ...prev, hospital: prev.hospital || hospitalName }));
  }, [hospitalName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blood, oxygen] = await Promise.all([
        bloodService.list({ page: 1, limit: 6 }),
        oxygenService.list({ page: 1, limit: 6 }),
      ]);
      setBloodRows(blood.items || []);
      setOxygenRows(oxygen.items || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch availability data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const bloodAvailability = useMemo(
    () => bloodRows.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [bloodRows]
  );

  const bloodAvailabilityByGroup = useMemo(() => {
    const groupTotals = BLOOD_GROUPS.reduce((acc, group) => {
      acc[group] = 0;
      return acc;
    }, {});

    bloodRows.forEach((item) => {
      const group = item.bloodGroup;
      if (!groupTotals[group] && groupTotals[group] !== 0) return;
      groupTotals[group] += Number(item.quantity || 0);
    });

    return BLOOD_GROUPS.map((group) => ({
      group,
      units: groupTotals[group],
    }));
  }, [bloodRows]);

  const oxygenAvailability = useMemo(
    () => oxygenRows.reduce((sum, item) => sum + Number(item.capacity || 0), 0),
    [oxygenRows]
  );

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!form.patientName.trim() || !form.hospital.trim()) {
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
        patientName: form.patientName.trim(),
        requestType: form.requestType,
        bloodGroup: form.requestType === "BLOOD" ? form.bloodGroup : undefined,
        oxygenUnits: form.requestType === "OXYGEN" ? Number(form.oxygenUnits) : undefined,
        hospital: form.hospital.trim(),
        priority: form.priority,
        notes: form.notes.trim(),
      });
      toast.success("Emergency request created successfully");
      setForm({ ...initialForm, hospital: hospitalName });
    } catch (error) {
      setFormError(error?.response?.data?.message || "Unable to create request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Hospital Resource Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">View live blood and oxygen availability and raise emergency requests.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Blood Availability</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{bloodAvailability} units</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Oxygen Availability</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{oxygenAvailability} capacity</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Create Emergency Request</h3>
        <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={submitRequest}>
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Patient name" value={form.patientName} onChange={(e) => setForm((prev) => ({ ...prev, patientName: e.target.value }))} />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.requestType} onChange={(e) => setForm((prev) => ({ ...prev, requestType: e.target.value }))}>
            <option value="BLOOD">Blood</option>
            <option value="OXYGEN">Oxygen</option>
          </select>
          {form.requestType === "BLOOD" ? (
            <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.bloodGroup} onChange={(e) => setForm((prev) => ({ ...prev, bloodGroup: e.target.value }))}>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          ) : (
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="1" placeholder="Oxygen units needed" value={form.oxygenUnits} onChange={(e) => setForm((prev) => ({ ...prev, oxygenUnits: e.target.value }))} />
          )}
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Hospital name" value={form.hospital} onChange={(e) => setForm((prev) => ({ ...prev, hospital: e.target.value }))} />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <button type="submit" disabled={saving} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-70">Create Request</button>
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2 lg:col-span-5" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </form>
        {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Blood Availability</h3>
        {!loading && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {bloodAvailabilityByGroup.map((item) => (
              <div key={item.group} className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
                <p className="text-xs font-semibold text-rose-700">{item.group}</p>
                <p className="text-sm font-bold text-slate-900">{item.units} units</p>
              </div>
            ))}
          </div>
        )}
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Blood Group</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bloodRows.map((row) => (
                  <tr key={row._id}>
                    <td className="px-3 py-2 text-sm font-semibold text-slate-900">{row.bloodGroup}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.quantity}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Oxygen Availability</h3>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cylinder ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Capacity</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {oxygenRows.map((row) => (
                  <tr key={row._id}>
                    <td className="px-3 py-2 text-sm font-semibold text-slate-900">{row.cylinderId}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.supplier}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.capacity}</td>
                    <td className="px-3 py-2 text-sm text-slate-700">{row.status}</td>
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

export default HospitalDashboardPage;
