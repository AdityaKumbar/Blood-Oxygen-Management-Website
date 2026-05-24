import AppError from "../utils/AppError.js";
import { OXYGEN_STATUS } from "../models/OxygenInventory.js";

const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());

export const validateCreateOxygenPayload = (req, res, next) => {
  const { cylinderId, supplier, capacity, status, lastRefillDate } = req.body;

  if (!cylinderId || !supplier || capacity === undefined || !status || !lastRefillDate) {
    return next(new AppError("cylinderId, supplier, capacity, status and lastRefillDate are required", 400));
  }

  if (Number(capacity) <= 0) {
    return next(new AppError("capacity must be greater than 0", 400));
  }

  if (!OXYGEN_STATUS.includes(status)) {
    return next(new AppError("Invalid oxygen status", 400));
  }

  if (!isValidDate(lastRefillDate)) {
    return next(new AppError("Invalid lastRefillDate", 400));
  }

  return next();
};

export const validateUpdateOxygenPayload = (req, res, next) => {
  const { capacity, status, lastRefillDate, cylinderId, supplier } = req.body;

  if (capacity !== undefined && Number(capacity) <= 0) {
    return next(new AppError("capacity must be greater than 0", 400));
  }

  if (status && !OXYGEN_STATUS.includes(status)) {
    return next(new AppError("Invalid oxygen status", 400));
  }

  if (lastRefillDate && !isValidDate(lastRefillDate)) {
    return next(new AppError("Invalid lastRefillDate", 400));
  }

  if (cylinderId !== undefined && !String(cylinderId).trim()) {
    return next(new AppError("cylinderId cannot be empty", 400));
  }

  if (supplier !== undefined && !String(supplier).trim()) {
    return next(new AppError("supplier cannot be empty", 400));
  }

  return next();
};
