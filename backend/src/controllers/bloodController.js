import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { addBloodStock, deleteBloodStock, listBloodStock, updateBloodStock } from "../services/bloodService.js";
import { emitSocketEvent } from "../sockets/emitter.js";
import { SOCKET_EVENTS } from "../sockets/events.js";

export const getBloodInventory = asyncHandler(async (req, res) => {
  const result = await listBloodStock(req.query);
  return successResponse(res, 200, "Blood inventory fetched successfully", result);
});

export const createBloodInventory = asyncHandler(async (req, res) => {
  const result = await addBloodStock(req.body);
  emitSocketEvent(req, SOCKET_EVENTS.INVENTORY_UPDATED, {
    module: "blood",
    action: "created",
    item: result,
  });
  return successResponse(res, 201, "Blood stock added successfully", result);
});

export const editBloodInventory = asyncHandler(async (req, res) => {
  const result = await updateBloodStock(req.params.id, req.body);
  emitSocketEvent(req, SOCKET_EVENTS.INVENTORY_UPDATED, {
    module: "blood",
    action: "updated",
    item: result,
  });
  return successResponse(res, 200, "Blood stock updated successfully", result);
});

export const removeBloodInventory = asyncHandler(async (req, res) => {
  await deleteBloodStock(req.params.id);
  emitSocketEvent(req, SOCKET_EVENTS.INVENTORY_UPDATED, {
    module: "blood",
    action: "deleted",
    id: req.params.id,
  });
  return successResponse(res, 200, "Blood stock deleted successfully", {});
});
