import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryModal from "../components/inventory/InventoryModal";
import DeleteConfirmModal from "../components/inventory/DeleteConfirmModal";
import Pagination from "../components/inventory/Pagination";
import { bloodService } from "../services/bloodService";

const emptyForm = {
  bloodGroup: "A+",
  quantity: "",
  expiryDate: "",
  storageLocation: "",
};

const InventoryPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [alerts, setAlerts] = useState({ lowStockCount: 0, expiredCount: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await bloodService.list({ page, limit: 8, search, status });
      setRows(data.items || []);
      setPagination(data.pagination || { page: 1, totalPages: 1 });
      setAlerts(data.alerts || { lowStockCount: 0, expiredCount: 0 });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, status]);

  const modalTitle = useMemo(() => (editingItem ? "Edit blood stock" : "Add blood stock"), [editingItem]);

  const validateForm = () => {
    if (!form.bloodGroup || !form.quantity || !form.expiryDate || !form.storageLocation.trim()) {
      return "All fields are required";
    }
    if (Number(form.quantity) < 0) {
      return "Quantity must be non-negative";
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
        bloodGroup: form.bloodGroup,
        quantity: Number(form.quantity),
        expiryDate: form.expiryDate,
        storageLocation: form.storageLocation.trim(),
      };

      if (editingItem) {
        await bloodService.update(editingItem._id, payload);
        toast.success("Stock updated successfully");
      } else {
        await bloodService.create(payload);
        toast.success("Stock added successfully");
      }

      setModalOpen(false);
      setEditingItem(null);
      setForm(emptyForm);
      fetchData();
    } catch (error) {
      setFormError(error?.response?.data?.message || "Unable to save stock");
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      bloodGroup: item.bloodGroup,
      quantity: item.quantity,
      expiryDate: new Date(item.expiryDate).toISOString().slice(0, 10),
      storageLocation: item.storageLocation,
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
      await bloodService.remove(deleteItem._id);
      toast.success("Stock deleted successfully");
      setDeleteOpen(false);
      setDeleteItem(null);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Blood Inventory Management</h2>
            <p className="text-sm text-slate-600">Low stock alerts: <span className="font-semibold text-amber-700">{alerts.lowStockCount}</span> | Expired: <span className="font-semibold text-rose-700">{alerts.expiredCount}</span></p>
          </div>
          <button type="button" onClick={openCreate} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Add Stock</button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search blood group or location"
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
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <InventoryTable rows={rows} loading={loading} onEdit={openEdit} onDelete={openDelete} />
      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />

      {modalOpen && (
        <InventoryModal
          title={modalTitle}
          values={form}
          onChange={(e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
          loading={saving}
          error={formError}
        />
      )}

      {deleteOpen && (
        <DeleteConfirmModal item={deleteItem} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} loading={saving} />
      )}
    </div>
  );
};

export default InventoryPage;
