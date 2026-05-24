import AppError from "../utils/AppError.js";
import { BLOOD_GROUPS } from "../models/BloodInventory.js";

const assertFutureDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return true;
};

export const validateCreateBloodPayload = (req, res, next) => {
  const { bloodGroup, quantity, expiryDate, storageLocation } = req.body;

  if (!bloodGroup || quantity === undefined || !expiryDate || !storageLocation) {
    return next(new AppError("bloodGroup, quantity, expiryDate and storageLocation are required", 400));
  }

  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    return next(new AppError("Invalid blood group", 400));
  }

  if (Number(quantity) < 0) {
    return next(new AppError("Quantity must be non-negative", 400));
  }

  if (!assertFutureDate(expiryDate)) {
    return next(new AppError("Invalid expiry date", 400));
  }

  return next();
};

export const validateUpdateBloodPayload = (req, res, next) => {
  const { bloodGroup, quantity, expiryDate, storageLocation } = req.body;

  if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
    return next(new AppError("Invalid blood group", 400));
  }

  if (quantity !== undefined && Number(quantity) < 0) {
    return next(new AppError("Quantity must be non-negative", 400));
  }

  if (expiryDate && !assertFutureDate(expiryDate)) {
    return next(new AppError("Invalid expiry date", 400));
  }

  if (storageLocation !== undefined && !String(storageLocation).trim()) {
    return next(new AppError("storageLocation cannot be empty", 400));
  }

  return next();
};
