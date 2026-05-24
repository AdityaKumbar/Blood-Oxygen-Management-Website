import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
};

export const generateRefreshToken = (payload) => {
  // Placeholder for refresh-token rollout. Keeps auth module refresh-ready.
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "30d" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};
