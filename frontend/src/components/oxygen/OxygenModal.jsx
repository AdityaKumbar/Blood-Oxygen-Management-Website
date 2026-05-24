import BaseModal from "../common/BaseModal";

const OxygenModal = ({ title, values, onChange, onSubmit, onClose, loading, error }) => {
  return (
    <BaseModal title={title} onClose={onClose} maxWidth="max-w-lg">
      <form className="mt-1 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Cylinder ID</span>
            <input name="cylinderId" value={values.cylinderId} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Supplier</span>
            <input name="supplier" value={values.supplier} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Capacity</span>
            <input name="capacity" type="number" min="1" value={values.capacity} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Status</span>
            <select name="status" value={values.status} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              {['FULL','IN_USE','EMPTY','REFILL_DUE','LOW_STOCK'].map((item) => (
                <option key={item} value={item}>{item.replace('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-slate-600">Last Refill Date</span>
            <input name="lastRefillDate" type="date" value={values.lastRefillDate} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default OxygenModal;
