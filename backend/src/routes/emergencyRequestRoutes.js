import { Router } from "express";
import {
  approveEmergencyRequest,
  assignEmergencyDonor,
  createRequest,
  editRequest,
  forwardEmergencyRequest,
  getEmergencyRequests,
  removeRequest,
  resolveEmergencyRequest,
} from "../controllers/emergencyRequestController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";
import {
  validateAssignDonorPayload,
  validateCreateEmergencyPayload,
  validateUpdateEmergencyPayload,
} from "../validators/emergencyRequestValidator.js";

const emergencyRequestRouter = Router();
const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL, ROLES.BLOOD_BANK, ROLES.DONOR];
const adminOnlyRoles = [ROLES.SUPER_ADMIN];
const donorAssignableRoles = [ROLES.SUPER_ADMIN, ROLES.DONOR];

emergencyRequestRouter.get("/", authenticate, authorizeRoles(...allowedRoles), getEmergencyRequests);
emergencyRequestRouter.post("/add", authenticate, authorizeRoles(...allowedRoles), validateCreateEmergencyPayload, createRequest);
emergencyRequestRouter.put("/update/:id", authenticate, authorizeRoles(...adminOnlyRoles), validateUpdateEmergencyPayload, editRequest);
emergencyRequestRouter.delete("/:id", authenticate, authorizeRoles(...adminOnlyRoles), removeRequest);

emergencyRequestRouter.patch("/:id/approve", authenticate, authorizeRoles(...adminOnlyRoles), approveEmergencyRequest);
emergencyRequestRouter.patch("/:id/forward-to-app", authenticate, authorizeRoles(...adminOnlyRoles), forwardEmergencyRequest);
emergencyRequestRouter.patch("/:id/assign", authenticate, authorizeRoles(...donorAssignableRoles), validateAssignDonorPayload, assignEmergencyDonor);
emergencyRequestRouter.patch("/:id/resolve", authenticate, authorizeRoles(...adminOnlyRoles), resolveEmergencyRequest);

export default emergencyRequestRouter;
