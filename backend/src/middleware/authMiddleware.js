import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

const extractToken = (authHeader = "") => {
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return next(new AppError("Authorization token missing", 401));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new AppError("Invalid token user", 401));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};
