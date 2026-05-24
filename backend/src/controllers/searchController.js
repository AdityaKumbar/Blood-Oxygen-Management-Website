import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { searchResources } from "../services/searchService.js";

export const search = asyncHandler(async (req, res) => {
  const result = await searchResources({
    query: req.query.query,
    bloodGroup: req.query.bloodGroup,
    availability: req.query.availability,
    includeBlood: req.query.includeBlood !== "false",
    includeOxygen: req.query.includeOxygen !== "false",
    includeHospitals: req.query.includeHospitals !== "false",
  });

  return successResponse(res, 200, "Resources fetched successfully", { results: result });
});
