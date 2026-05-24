import { Router } from "express";
import { search } from "../controllers/searchController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../utils/roles.js";

const searchRouter = Router();

searchRouter.get(
  "/resources",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.HOSPITAL, ROLES.BLOOD_BANK, ROLES.OXYGEN_SUPPLIER, ROLES.DONOR),
  search
);

export default searchRouter;
