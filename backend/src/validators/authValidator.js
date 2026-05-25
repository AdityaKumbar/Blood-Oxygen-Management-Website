import AppError from "../utils/AppError.js";
import { ROLE_VALUES } from "../utils/roles.js";

export const validateRegisterPayload = (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return next(new AppError("name, email, password and role are required", 400));
  }

  if (typeof password !== "string" || password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  if (phone && !/^[0-9]{10,14}$/.test(String(phone))) {
    return next(new AppError("Phone must be 10 to 14 digits", 400));
  }

  if (!ROLE_VALUES.includes(role)) {
    return next(new AppError("Invalid role provided", 400));
  }

  return next();
};

export const validateUpdateProfilePayload = (req, res, next) => {
  const { name, phone, avatarUrl } = req.body || {};

  if (!name && !phone && avatarUrl === undefined) {
    return next(new AppError("At least one of name, phone or avatarUrl is required", 400));
  }

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 3)) {
    return next(new AppError("Name should be at least 3 characters", 400));
  }

  if (phone !== undefined) {
    const normalizedPhone = String(phone).trim();
    if (normalizedPhone && !/^[0-9]{10,14}$/.test(normalizedPhone)) {
      return next(new AppError("Phone must be 10 to 14 digits", 400));
    }
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
    return next(new AppError("avatarUrl should be a string", 400));
  }

  return next();
};

export const validateLoginPayload = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("email and password are required", 400));
  }

  return next();
};
