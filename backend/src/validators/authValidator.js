import AppError from "../utils/AppError.js";
import { ROLE_VALUES } from "../utils/roles.js";

export const validateRegisterPayload = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return next(new AppError("name, email, password and role are required", 400));
  }

  if (typeof password !== "string" || password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400));
  }

  if (!ROLE_VALUES.includes(role)) {
    return next(new AppError("Invalid role provided", 400));
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
