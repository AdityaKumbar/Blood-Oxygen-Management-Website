import { errorResponse } from "../utils/response.js";

const notFound = (req, res) => {
  return errorResponse(res, 404, `Route not found: ${req.originalUrl}`);
};

export default notFound;
