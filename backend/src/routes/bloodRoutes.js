import { Router } from "express";
import { createBloodInventory, editBloodInventory, getBloodInventory, removeBloodInventory } from "../controllers/bloodController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";
import { validateCreateBloodPayload, validateUpdateBloodPayload } from "../validators/bloodValidator.js";

const bloodRouter = Router();

const inventoryRoles = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL, ROLES.BLOOD_BANK];

bloodRouter.get("/", authenticate, authorizeRoles(...inventoryRoles), getBloodInventory);
bloodRouter.post("/add", authenticate, authorizeRoles(...inventoryRoles), validateCreateBloodPayload, createBloodInventory);
bloodRouter.put("/update/:id", authenticate, authorizeRoles(...inventoryRoles), validateUpdateBloodPayload, editBloodInventory);
bloodRouter.delete("/:id", authenticate, authorizeRoles(...inventoryRoles), removeBloodInventory);

export default bloodRouter;
