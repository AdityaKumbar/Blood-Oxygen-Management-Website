import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { generateAssistantReply } from "../services/assistantService.js";

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const result = await generateAssistantReply({
    message: req.body.message,
    history: req.body.history || [],
  });

  return successResponse(res, 200, "Assistant response generated successfully", result);
});
