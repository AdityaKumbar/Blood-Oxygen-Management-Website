import BaseModal from "../common/BaseModal";

const EmergencyRequestModal = ({
  request,
  onClose,
  onApprove,
  onForwardToApp,
  onAssign,
  onResolve,
  loading,
  donorName,
  setDonorName,
  forwardNotes,
  setForwardNotes,
  showActions = true,
}) => {
  if (!request) return null;

  return (
    <BaseModal title="Emergency Request Details" onClose={onClose} maxWidth="max-w-2xl">
      <p className="-mt-2 text-sm text-slate-500">Request ID: {request._id}</p>

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <p><span className="font-semibold text-slate-700">Patient:</span> {request.patientName}</p>
        <p><span className="font-semibold text-slate-700">Request Type:</span> {request.requestType || "BLOOD"}</p>
        <p>
          <span className="font-semibold text-slate-700">
            {(request.requestType || "BLOOD") === "OXYGEN" ? "Oxygen Units:" : "Blood Group:"}
          </span>{" "}
          {(request.requestType || "BLOOD") === "OXYGEN" ? request.oxygenUnits || "-" : request.bloodGroup || "-"}
        </p>
        <p><span className="font-semibold text-slate-700">Hospital:</span> {request.hospital}</p>
        <p><span className="font-semibold text-slate-700">Priority:</span> {request.priority}</p>
        <p><span className="font-semibold text-slate-700">Status:</span> {request.status}</p>
        <p><span className="font-semibold text-slate-700">Assigned Donor:</span> {request.assignedDonor || "-"}</p>
        <p className="sm:col-span-2"><span className="font-semibold text-slate-700">Notes:</span> {request.notes || "-"}</p>
      </div>

      {showActions && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onApprove} disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">Approve</button>
            <button type="button" onClick={onResolve} disabled={loading} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">Mark Resolved</button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Assign donor name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="button" onClick={onAssign} disabled={loading} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">Assign Donor</button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input value={forwardNotes} onChange={(e) => setForwardNotes(e.target.value)} placeholder="Forward notes (stock unavailable)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="button" onClick={onForwardToApp} disabled={loading} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">Forward to App</button>
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default EmergencyRequestModal;
