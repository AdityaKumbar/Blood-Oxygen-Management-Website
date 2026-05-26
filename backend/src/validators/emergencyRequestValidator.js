import AppError from "../utils/AppError.js";
import { PRIORITY_LEVELS, REQUEST_STATUS, REQUEST_TYPES } from "../models/EmergencyRequest.js";

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const validateCreateEmergencyPayload = (req, res, next) => {
  const { patientName, requestType = "BLOOD", bloodGroup, oxygenUnits, unitsRequired, hospital, priority, contactNumber, isInventory } = req.body;

  if (!isInventory) {
    if (!patientName || !hospital || !priority) {
      return next(new AppError("patientName, hospital and priority are required", 400));
    }
  }

  if (!REQUEST_TYPES.includes(requestType)) {
    return next(new AppError("Invalid request type", 400));
  }

  if (requestType === "BLOOD" && !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    return next(new AppError("Invalid blood group", 400));
  }

  if (requestType === "OXYGEN" && (!Number.isFinite(Number(oxygenUnits)) || Number(oxygenUnits) <= 0)) {
    return next(new AppError("oxygenUnits must be greater than 0 for oxygen requests", 400));
  }

  if (unitsRequired !== undefined && (!Number.isFinite(Number(unitsRequired)) || Number(unitsRequired) <= 0)) {
    return next(new AppError("unitsRequired must be greater than 0", 400));
  }

  if (priority !== undefined && !PRIORITY_LEVELS.includes(priority)) {
    return next(new AppError("Invalid priority", 400));
  }

  if (contactNumber !== undefined && !/^\+?[0-9]{10,15}$/.test(String(contactNumber).trim())) {
    return next(new AppError("Invalid contact number", 400));
  }

  return next();
};

export const validateUpdateEmergencyPayload = (req, res, next) => {
  const { patientName, requestType, bloodGroup, oxygenUnits, unitsRequired, hospital, priority, status, assignedDonor, contactNumber } = req.body;

  if (requestType && !REQUEST_TYPES.includes(requestType)) {
    return next(new AppError("Invalid request type", 400));
  }

  if (bloodGroup && !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    return next(new AppError("Invalid blood group", 400));
  }

  if (oxygenUnits !== undefined && (!Number.isFinite(Number(oxygenUnits)) || Number(oxygenUnits) <= 0)) {
    return next(new AppError("oxygenUnits must be greater than 0", 400));
  }

  if (unitsRequired !== undefined && (!Number.isFinite(Number(unitsRequired)) || Number(unitsRequired) <= 0)) {
    return next(new AppError("unitsRequired must be greater than 0", 400));
  }

  if (priority && !PRIORITY_LEVELS.includes(priority)) {
    return next(new AppError("Invalid priority", 400));
  }

  if (status && !REQUEST_STATUS.includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  if (patientName !== undefined && !String(patientName).trim()) {
    return next(new AppError("patientName cannot be empty", 400));
  }

  if (hospital !== undefined && !String(hospital).trim()) {
    return next(new AppError("hospital cannot be empty", 400));
  }

  if (assignedDonor !== undefined && typeof assignedDonor !== "string") {
    return next(new AppError("assignedDonor must be a string", 400));
  }

  if (contactNumber !== undefined && !/^\+?[0-9]{10,15}$/.test(String(contactNumber).trim())) {
    return next(new AppError("Invalid contact number", 400));
  }

  return next();
};

export const validateAssignDonorPayload = (req, res, next) => {
  const { assignedDonor } = req.body;

  if (!assignedDonor || !String(assignedDonor).trim()) {
    return next(new AppError("assignedDonor is required", 400));
  }

  return next();
};
