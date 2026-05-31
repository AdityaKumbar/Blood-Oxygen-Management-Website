import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";
import { chatWithAssistant } from "../controllers/assistantController.js";

const assistantRouter = Router();

assistantRouter.post(
  "/chat",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.HOSPITAL, ROLES.BLOOD_BANK, ROLES.OXYGEN_SUPPLIER),
  chatWithAssistant
);

export default assistantRouter;
