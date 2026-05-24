import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import OxygenTable from "../components/oxygen/OxygenTable";
import OxygenModal from "../components/oxygen/OxygenModal";
import DeleteConfirmModal from "../components/inventory/DeleteConfirmModal";
import Pagination from "../components/inventory/Pagination";
import { oxygenService } from "../services/oxygenService";

const initialForm = {
  cylinderId: "",
  supplier: "",
  capacity: "",
  status: "FULL",
  lastRefillDate: "",
};

const OxygenInventoryPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [alerts, setAlerts] = useState({ lowStockCount: 0, refillDueCount: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await oxygenService.list({ page, limit: 8, search, supplier, status });
      setRows(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
      setAlerts(data.alerts || { lowStockCount: 0, refillDueCount: 0 });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch oxygen inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, supplier, status]);

  const modalTitle = useMemo(() => (editingItem ? "Edit oxygen cylinder" : "Add oxygen cylinder"), [editingItem]);

  const validateForm = () => {
    if (!form.cylinderId.trim() || !form.supplier.trim() || !form.capacity || !form.status || !form.lastRefillDate) {
      return "All fields are required";
    }
    if (Number(form.capacity) <= 0) {
      return "Capacity must be greater than 0";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      const payload = {
        cylinderId: form.cylinderId.trim(),
        supplier: form.supplier.trim(),
        capacity: Number(form.capacity),
        status: form.status,
        lastRefillDate: form.lastRefillDate,
      };

      if (editingItem) {
        await oxygenService.update(editingItem._id, payload);
        toast.success("Cylinder updated successfully");
      } else {
        await oxygenService.create(payload);
        toast.success("Cylinder added successfully");
      }

      setModalOpen(false);
      setEditingItem(null);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      setFormError(error?.response?.data?.message || "Unable to save cylinder");
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(initialForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      cylinderId: item.cylinderId,
      supplier: item.supplier,
      capacity: item.capacity,
      status: item.status,
      lastRefillDate: new Date(item.lastRefillDate).toISOString().slice(0, 10),
    });
    setFormError("");
    setModalOpen(true);
  };

  const openDelete = (item) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setSaving(true);
      await oxygenService.remove(deleteItem._id);
      toast.success("Cylinder deleted successfully");
      setDeleteOpen(false);
      setDeleteItem(null);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete cylinder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Oxygen Inventory Management</h2>
            <p className="text-sm text-slate-600">Low stock: <span className="font-semibold text-amber-700">{alerts.lowStockCount}</span> | Refill due: <span className="font-semibold text-rose-700">{alerts.refillDueCount}</span></p>
          </div>
          <button type="button" onClick={openCreate} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Add Cylinder</button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search cylinder or supplier"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={supplier}
            onChange={(e) => {
              setPage(1);
              setSupplier(e.target.value);
            }}
            placeholder="Filter by supplier"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="FULL">Full</option>
            <option value="IN_USE">In Use</option>
            <option value="EMPTY">Empty</option>
            <option value="REFILL_DUE">Refill Due</option>
            <option value="LOW_STOCK">Low Stock</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSupplier("");
              setStatus("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <OxygenTable rows={rows} loading={loading} onEdit={openEdit} onDelete={openDelete} />
      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />

      {modalOpen && (
        <OxygenModal
          title={modalTitle}
          values={form}
          onChange={(e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
          loading={saving}
          error={formError}
        />
      )}

      {deleteOpen && <DeleteConfirmModal item={deleteItem} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={saving} />}
    </div>
  );
};

export default OxygenInventoryPage;
