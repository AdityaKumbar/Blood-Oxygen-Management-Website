import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import UserHistoryModal from "../components/admin/UserHistoryModal";

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await authService.listUsers({ role: "HOSPITAL", search, status });
      setHospitals(data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [search, status]);

  const openHistory = async (hospital) => {
    setSelectedHospital(hospital);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const details = await authService.getUserHistory(hospital.id);
      setHistory(details?.emergencyRequests || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch hospital history");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Hospitals</h2>
        <p className="mt-1 text-sm text-slate-600">View hospitals and their emergency request history.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital name or email"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button type="button" onClick={() => { setSearch(""); setStatus(""); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            Reset Filters
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="animate-pulse space-y-3 py-4">
            <div className="h-10 rounded-lg bg-slate-100" />
            <div className="h-10 rounded-lg bg-slate-100" />
          </div>
        ) : hospitals.length === 0 ? (
          <p className="text-sm text-slate-500">No hospitals found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hospital</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {hospitals.map((hospital) => (
                  <tr key={hospital.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{hospital.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{hospital.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{hospital.accountStatus}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(hospital.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openHistory(hospital)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedHospital && (
        <UserHistoryModal
          user={selectedHospital}
          history={history}
          loading={historyLoading}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
};

export default HospitalsPage;
