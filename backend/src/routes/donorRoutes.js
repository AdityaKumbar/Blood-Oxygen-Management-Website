import { Router } from "express";
import { history, profile, register, updateAvailability } from "../controllers/donorController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";

const donorRouter = Router();

donorRouter.get("/profile", authenticate, authorizeRoles(ROLES.DONOR), profile);
donorRouter.post("/register", authenticate, authorizeRoles(ROLES.DONOR), register);
donorRouter.patch("/availability", authenticate, authorizeRoles(ROLES.DONOR), updateAvailability);
donorRouter.get("/history", authenticate, authorizeRoles(ROLES.DONOR), history);

export default donorRouter;
