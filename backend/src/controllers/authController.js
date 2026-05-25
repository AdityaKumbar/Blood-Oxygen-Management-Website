import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  approveUserAccount,
  getUserProfile,
  getUserHistory,
  listUsers,
  listPendingUsers,
  loginUser,
  registerUser,
  updateUserProfile,
  rejectUserAccount,
} from "../services/authService.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  return successResponse(res, 201, "User registered successfully", result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  return successResponse(res, 200, "Login successful", result);
});

export const profile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  return successResponse(res, 200, "Profile fetched successfully", user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user.id, req.body || {});
  return successResponse(res, 200, "Profile updated successfully", user);
});

export const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await listPendingUsers();
  return successResponse(res, 200, "Pending users fetched successfully", users);
});

export const approvePendingUser = asyncHandler(async (req, res) => {
  const user = await approveUserAccount(req.params.id, req.user.id);
  return successResponse(res, 200, "User account approved successfully", user);
});

export const rejectPendingUser = asyncHandler(async (req, res) => {
  const user = await rejectUserAccount(req.params.id, req.user.id, req.body?.rejectionReason || "");
  return successResponse(res, 200, "User account rejected successfully", user);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers(req.query);
  return successResponse(res, 200, "Users fetched successfully", users);
});

export const getUserHistoryDetails = asyncHandler(async (req, res) => {
  const details = await getUserHistory(req.params.id);
  return successResponse(res, 200, "User history fetched successfully", details);
});
