import BaseModal from "../common/BaseModal";

const DeleteConfirmModal = ({ item, onConfirm, onClose, loading }) => {
  return (
    <BaseModal title="Delete record" onClose={onClose} maxWidth="max-w-md">
      <p className="mt-2 text-sm text-slate-600">
        Delete this entry {item?.bloodGroup ? `(${item.bloodGroup})` : ""} at {item?.storageLocation || item?.supplier || "selected location"}? This action cannot be undone.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button>
        <button type="button" onClick={onConfirm} disabled={loading} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmModal;
