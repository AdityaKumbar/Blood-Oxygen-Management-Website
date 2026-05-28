import EmergencyRequest from "../models/EmergencyRequest.js";
import AppError from "../utils/AppError.js";
import { recordDonationFromEmergency, resolveDonorUserId } from "./donationService.js";

const sanitize = (doc) => (doc.toObject ? doc.toObject() : doc);

export const createEmergencyRequest = async (payload, user) => {
  const requestType = payload.requestType || "BLOOD";
  const isInventory = !!payload.isInventory;
  const patientName = isInventory ? (payload.patientName || "Inventory Request") : payload.patientName;
  const hospital = isInventory ? (payload.hospital || user?.name || "Blood Bank") : payload.hospital;
  const priority = isInventory ? (payload.priority || "MEDIUM") : payload.priority;
  const status = isInventory ? "FORWARDED_TO_APP" : "PENDING";
  const forwardedAt = isInventory ? new Date() : null;

  const created = await EmergencyRequest.create({
    ...payload,
    patientName,
    hospital,
    priority,
    requestType,
    isInventory,
    bloodGroup: requestType === "BLOOD" ? payload.bloodGroup : null,
    oxygenUnits: requestType === "OXYGEN" ? Number(payload.oxygenUnits) : null,
    unitsRequired: Number(payload.unitsRequired) > 0 ? Number(payload.unitsRequired) : 1,
    contactNumber: payload.contactNumber || "",
    createdBy: user?.id || null,
    status,
    assignedDonor: "",
    resolvedAt: null,
    forwardedAt,
  });
  return sanitize(created);
};

export const listEmergencyRequests = async ({ page = 1, limit = 10, search = "", status = "", priority = "", forApp = "false", mine = "false" }, user) => {
  const isForApp = String(forApp).toLowerCase() === "true";
  const isMine = String(mine).toLowerCase() === "true";
  const query = {};
  const andConditions = [];

  if (isMine && user?.id) {
    query.createdBy = user.id;
    query.isInventory = { $ne: true };
  }

  if (status) {
    query.status = status;
  } else if (isForApp && !isMine) {
    query.status = { $in: ["FORWARDED_TO_APP", "ASSIGNED", "RESOLVED"] };
  }
  if (priority) query.priority = priority;

  if (search) {
    andConditions.push({
      $or: [
      { patientName: { $regex: search, $options: "i" } },
      { hospital: { $regex: search, $options: "i" } },
      { assignedDonor: { $regex: search, $options: "i" } },
      { bloodGroup: { $regex: search, $options: "i" } },
      { requestType: { $regex: search, $options: "i" } },
      { contactNumber: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (andConditions.length) {
    query.$and = andConditions;
  }

  const numericPage = Math.max(Number(page) || 1, 1);
  const numericLimit = Math.max(Number(limit) || 10, 1);

  const [items, total] = await Promise.all([
    EmergencyRequest.find(query)
      .populate("createdBy", "name phone latitude longitude address")
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit),
    EmergencyRequest.countDocuments(query),
  ]);

  return {
    items: items.map(sanitize),
    pagination: {
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit),
    },
  };
};

export const updateEmergencyRequest = async (id, payload) => {
  const existing = await EmergencyRequest.findById(id);
  if (!existing) {
    throw new AppError("Emergency request not found", 404);
  }

  Object.assign(existing, payload);
  if (payload.requestType === "BLOOD") {
    existing.oxygenUnits = null;
  }
  if (payload.requestType === "OXYGEN") {
    existing.bloodGroup = null;
  }
  if (payload.status !== "RESOLVED") {
    existing.resolvedAt = null;
  }
  if (payload.status !== "FORWARDED_TO_APP") {
    existing.forwardedAt = null;
  }

  await existing.save();
  return sanitize(existing);
};

export const deleteEmergencyRequest = async (id) => {
  const deleted = await EmergencyRequest.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError("Emergency request not found", 404);
  }
};

const getRequestOrThrow = async (id) => {
  const record = await EmergencyRequest.findById(id);
  if (!record) {
    throw new AppError("Emergency request not found", 404);
  }
  return record;
};

export const approveRequest = async (id) => {
  const record = await getRequestOrThrow(id);
  record.status = "APPROVED";
  await record.save();
  return sanitize(record);
};

export const rejectRequest = async (id, notes = "") => {
  const record = await getRequestOrThrow(id);
  record.status = "REJECTED";
  if (notes) record.notes = notes;
  await record.save();
  return sanitize(record);
};

export const forwardRequestToApp = async (id, notes = "") => {
  const record = await getRequestOrThrow(id);
  record.status = "FORWARDED_TO_APP";
  record.forwardedAt = new Date();
  if (notes) record.notes = notes;
  await record.save();
  return sanitize(record);
};

export const assignRequestDonor = async (id, assignedDonor, options = {}) => {
  const { requireForwarded = false, donorUserId = null } = options;
  const record = await getRequestOrThrow(id);
  if (requireForwarded && record.status !== "FORWARDED_TO_APP") {
    throw new AppError("Only forwarded requests can be accepted by donor", 400);
  }
  record.assignedDonor = assignedDonor;
  if (donorUserId) {
    record.assignedDonorUserId = donorUserId;
  }
  record.status = "ASSIGNED";
  await record.save();
  return sanitize(record);
};

export const resolveRequest = async (id) => {
  const record = await getRequestOrThrow(id);
  record.status = "RESOLVED";
  record.resolvedAt = new Date();
  await record.save();

  const donorUserId = await resolveDonorUserId(record);
  if (donorUserId) {
    await recordDonationFromEmergency(record, donorUserId);
  }

  return sanitize(record);
};
