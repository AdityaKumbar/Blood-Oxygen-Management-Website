import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  approveRequest,
  assignRequestDonor,
  createEmergencyRequest,
  deleteEmergencyRequest,
  forwardRequestToApp,
  listEmergencyRequests,
  resolveRequest,
  updateEmergencyRequest,
} from "../services/emergencyRequestService.js";
import { emitSocketEvent } from "../sockets/emitter.js";
import { SOCKET_EVENTS } from "../sockets/events.js";

export const getEmergencyRequests = asyncHandler(async (req, res) => {
  const result = await listEmergencyRequests(req.query, req.user);
  return successResponse(res, 200, "Emergency requests fetched successfully", result);
});

export const createRequest = asyncHandler(async (req, res) => {
  const result = await createEmergencyRequest(req.body, req.user);
  emitSocketEvent(req, SOCKET_EVENTS.NEW_EMERGENCY, result);
  return successResponse(res, 201, "Emergency request created successfully", result);
});

export const editRequest = asyncHandler(async (req, res) => {
  const result = await updateEmergencyRequest(req.params.id, req.body);
  emitSocketEvent(req, SOCKET_EVENTS.NEW_EMERGENCY, { ...result, updated: true });
  return successResponse(res, 200, "Emergency request updated successfully", result);
});

export const removeRequest = asyncHandler(async (req, res) => {
  await deleteEmergencyRequest(req.params.id);
  emitSocketEvent(req, SOCKET_EVENTS.NEW_EMERGENCY, { id: req.params.id, deleted: true });
  return successResponse(res, 200, "Emergency request deleted successfully", {});
});

export const approveEmergencyRequest = asyncHandler(async (req, res) => {
  const result = await approveRequest(req.params.id);
  emitSocketEvent(req, SOCKET_EVENTS.REQUEST_APPROVED, result);
  return successResponse(res, 200, "Emergency request approved", result);
});

export const forwardEmergencyRequest = asyncHandler(async (req, res) => {
  const result = await forwardRequestToApp(req.params.id, req.body.notes || "");
  emitSocketEvent(req, SOCKET_EVENTS.REQUEST_FORWARDED, result);
  return successResponse(res, 200, "Emergency request forwarded to app queue", result);
});

export const assignEmergencyDonor = asyncHandler(async (req, res) => {
  const isDonor = req.user.role === "DONOR";
  const donorName = isDonor ? req.user.name : req.body.assignedDonor;
  const result = await assignRequestDonor(req.params.id, donorName, { requireForwarded: isDonor });
  emitSocketEvent(req, SOCKET_EVENTS.DONOR_ASSIGNED, result);
  return successResponse(res, 200, "Donor assigned successfully", result);
});

export const resolveEmergencyRequest = asyncHandler(async (req, res) => {
  const result = await resolveRequest(req.params.id);
  emitSocketEvent(req, SOCKET_EVENTS.NEW_EMERGENCY, { ...result, resolved: true });
  return successResponse(res, 200, "Emergency request marked as resolved", result);
});
