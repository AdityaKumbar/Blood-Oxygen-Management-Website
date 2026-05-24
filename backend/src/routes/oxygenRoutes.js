import { Router } from "express";
import {
  createOxygenInventory,
  editOxygenInventory,
  getOxygenInventory,
  removeOxygenInventory,
} from "../controllers/oxygenController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";
import { validateCreateOxygenPayload, validateUpdateOxygenPayload } from "../validators/oxygenValidator.js";

const oxygenRouter = Router();

const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL, ROLES.OXYGEN_SUPPLIER];

oxygenRouter.get("/", authenticate, authorizeRoles(...allowedRoles), getOxygenInventory);
oxygenRouter.post("/add", authenticate, authorizeRoles(...allowedRoles), validateCreateOxygenPayload, createOxygenInventory);
oxygenRouter.put("/update/:id", authenticate, authorizeRoles(...allowedRoles), validateUpdateOxygenPayload, editOxygenInventory);
oxygenRouter.delete("/:id", authenticate, authorizeRoles(...allowedRoles), removeOxygenInventory);

export default oxygenRouter;
