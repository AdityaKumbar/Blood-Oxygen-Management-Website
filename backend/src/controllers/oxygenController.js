import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  addOxygenInventory,
  deleteOxygenInventory,
  listOxygenInventory,
  updateOxygenInventory,
} from "../services/oxygenService.js";
import { emitSocketEvent } from "../sockets/emitter.js";
import { SOCKET_EVENTS } from "../sockets/events.js";

export const getOxygenInventory = asyncHandler(async (req, res) => {
  const result = await listOxygenInventory(req.query);
  return successResponse(res, 200, "Oxygen inventory fetched successfully", result);
});

export const createOxygenInventory = asyncHandler(async (req, res) => {
  const result = await addOxygenInventory(req.body);
  emitSocketEvent(req, SOCKET_EVENTS.INVENTORY_UPDATED, {
    module: "oxygen",
    action: "created",
    item: result,
  });
  return successResponse(res, 201, "Oxygen inventory added successfully", result);
});

export const editOxygenInventory = asyncHandler(async (req, res) => {
  const result = await updateOxygenInventory(req.params.id, req.body);
  emitSocketEvent(req, SOCKET_EVENTS.INVENTORY_UPDATED, {
    module: "oxygen",
    action: "updated",
    item: result,
  });
  return successResponse(res, 200, "Oxygen inventory updated successfully", result);
});

export const removeOxygenInventory = asyncHandler(async (req, res) => {
  await deleteOxygenInventory(req.params.id);
  emitSocketEvent(req, SOCKET_EVENTS.INVENTORY_UPDATED, {
    module: "oxygen",
    action: "deleted",
    id: req.params.id,
  });
  return successResponse(res, 200, "Oxygen inventory deleted successfully", {});
});
