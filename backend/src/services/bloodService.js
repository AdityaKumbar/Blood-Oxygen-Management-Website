import BloodInventory from "../models/BloodInventory.js";
import AppError from "../utils/AppError.js";

const LOW_STOCK_THRESHOLD = 20;

const deriveStatus = (quantity, expiryDate) => {
  const expiry = new Date(expiryDate);
  if (expiry <= new Date()) return "EXPIRED";
  if (Number(quantity) <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
  return "AVAILABLE";
};

const withComputedFields = (doc) => {
  const entry = doc.toObject ? doc.toObject() : doc;
  return {
    ...entry,
    status: deriveStatus(entry.quantity, entry.expiryDate),
    isLowStock: Number(entry.quantity) <= LOW_STOCK_THRESHOLD,
    isExpired: new Date(entry.expiryDate) <= new Date(),
  };
};

export const addBloodStock = async (payload) => {
  const status = deriveStatus(payload.quantity, payload.expiryDate);
  const item = await BloodInventory.create({ ...payload, status });
  return withComputedFields(item);
};

export const updateBloodStock = async (id, payload) => {
  const existing = await BloodInventory.findById(id);
  if (!existing) {
    throw new AppError("Blood inventory record not found", 404);
  }

  const nextQuantity = payload.quantity ?? existing.quantity;
  const nextExpiryDate = payload.expiryDate ?? existing.expiryDate;

  existing.bloodGroup = payload.bloodGroup ?? existing.bloodGroup;
  existing.quantity = nextQuantity;
  existing.expiryDate = nextExpiryDate;
  existing.storageLocation = payload.storageLocation ?? existing.storageLocation;
  existing.status = deriveStatus(nextQuantity, nextExpiryDate);

  await existing.save();
  return withComputedFields(existing);
};

export const deleteBloodStock = async (id) => {
  const deleted = await BloodInventory.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError("Blood inventory record not found", 404);
  }
};

export const listBloodStock = async ({ page = 1, limit = 10, search = "", bloodGroup, status }) => {
  const query = {};

  if (bloodGroup) query.bloodGroup = bloodGroup;

  if (search) {
    query.$or = [
      { bloodGroup: { $regex: search, $options: "i" } },
      { storageLocation: { $regex: search, $options: "i" } },
    ];
  }

  const numericPage = Math.max(Number(page) || 1, 1);
  const numericLimit = Math.max(Number(limit) || 10, 1);

  const [items, total] = await Promise.all([
    BloodInventory.find(query)
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    BloodInventory.countDocuments(query),
  ]);

  let enriched = items.map(withComputedFields);
  if (status) {
    enriched = enriched.filter((item) => item.status === status);
  }

  const alertSummary = {
    lowStockCount: enriched.filter((i) => i.isLowStock && !i.isExpired).length,
    expiredCount: enriched.filter((i) => i.isExpired).length,
  };

  return {
    items: enriched,
    pagination: {
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit),
    },
    alerts: alertSummary,
  };
};
