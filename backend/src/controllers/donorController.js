import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  getDonorHistory,
  getDonorProfile,
  registerDonorProfile,
  setDonorAvailability,
} from "../services/donorService.js";

export const profile = asyncHandler(async (req, res) => {
  const result = await getDonorProfile(req.user.id);
  return successResponse(res, 200, "Donor profile fetched successfully", result);
});

export const register = asyncHandler(async (req, res) => {
  const result = await registerDonorProfile(req.user.id, req.body);
  return successResponse(res, 201, "Donor profile registered successfully", result);
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const result = await setDonorAvailability(req.user.id, req.body?.isAvailable);
  return successResponse(res, 200, "Donor availability updated successfully", result);
});

export const history = asyncHandler(async (req, res) => {
  const result = await getDonorHistory(req.user.id);
  return successResponse(res, 200, "Donation history fetched successfully", result);
});
