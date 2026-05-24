import BaseModal from "../common/BaseModal";

const InventoryModal = ({ title, values, onChange, onSubmit, onClose, loading, error }) => {
  return (
    <BaseModal title={title} onClose={onClose} maxWidth="max-w-lg">
      <form className="mt-1 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Blood Group</span>
            <select name="bloodGroup" value={values.bloodGroup} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Quantity</span>
            <input name="quantity" type="number" min="0" value={values.quantity} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Expiry Date</span>
            <input name="expiryDate" type="date" value={values.expiryDate} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-slate-600">Storage Location</span>
            <input name="storageLocation" value={values.storageLocation} onChange={onChange} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
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

export default InventoryModal;
