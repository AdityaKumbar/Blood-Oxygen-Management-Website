const BaseModal = ({ title, children, onClose, maxWidth = "max-w-lg" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-2xl`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
