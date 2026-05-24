import OxygenInventory from "../models/OxygenInventory.js";
import AppError from "../utils/AppError.js";

const LOW_STOCK_CAPACITY_THRESHOLD = 20;
const REFILL_DUE_DAYS = 30;

const computeStatus = (record) => {
  const refillDate = new Date(record.lastRefillDate);
  const daysSinceRefill = Math.floor((Date.now() - refillDate.getTime()) / (1000 * 60 * 60 * 24));

  if (record.status === "EMPTY") return "EMPTY";
  if (record.capacity <= LOW_STOCK_CAPACITY_THRESHOLD) return "LOW_STOCK";
  if (daysSinceRefill >= REFILL_DUE_DAYS) return "REFILL_DUE";
  return record.status;
};

const enrich = (doc) => {
  const record = doc.toObject ? doc.toObject() : doc;
  const computedStatus = computeStatus(record);
  return {
    ...record,
    status: computedStatus,
    isLowStock: Number(record.capacity) <= LOW_STOCK_CAPACITY_THRESHOLD,
    refillDue: Math.floor((Date.now() - new Date(record.lastRefillDate).getTime()) / (1000 * 60 * 60 * 24)) >= REFILL_DUE_DAYS,
  };
};

export const listOxygenInventory = async ({ page = 1, limit = 10, search = "", status = "", supplier = "" }) => {
  const query = {};

  if (supplier) {
    query.supplier = { $regex: supplier, $options: "i" };
  }

  if (search) {
    query.$or = [
      { cylinderId: { $regex: search, $options: "i" } },
      { supplier: { $regex: search, $options: "i" } },
    ];
  }

  const numericPage = Math.max(Number(page) || 1, 1);
  const numericLimit = Math.max(Number(limit) || 10, 1);

  const [items, total] = await Promise.all([
    OxygenInventory.find(query)
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    OxygenInventory.countDocuments(query),
  ]);

  let rows = items.map(enrich);
  if (status) {
    rows = rows.filter((item) => item.status === status);
  }

  return {
    items: rows,
    alerts: {
      lowStockCount: rows.filter((item) => item.isLowStock).length,
      refillDueCount: rows.filter((item) => item.refillDue).length,
    },
    pagination: {
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit),
    },
  };
};

export const addOxygenInventory = async (payload) => {
  const exists = await OxygenInventory.findOne({ cylinderId: payload.cylinderId });
  if (exists) {
    throw new AppError("Cylinder ID already exists", 409);
  }

  const created = await OxygenInventory.create(payload);
  return enrich(created);
};

export const updateOxygenInventory = async (id, payload) => {
  const existing = await OxygenInventory.findById(id);
  if (!existing) {
    throw new AppError("Oxygen inventory record not found", 404);
  }

  if (payload.cylinderId && payload.cylinderId !== existing.cylinderId) {
    const taken = await OxygenInventory.findOne({ cylinderId: payload.cylinderId });
    if (taken) {
      throw new AppError("Cylinder ID already exists", 409);
    }
  }

  Object.assign(existing, payload);
  await existing.save();
  return enrich(existing);
};

export const deleteOxygenInventory = async (id) => {
  const deleted = await OxygenInventory.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError("Oxygen inventory record not found", 404);
  }
};
