import { Router } from "express";
import {
  approvePendingUser,
  getPendingUsers,
  getUserHistoryDetails,
  getUsers,
  login,
  profile,
  register,
  rejectPendingUser,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { validateLoginPayload, validateRegisterPayload } from "../validators/authValidator.js";
import { ROLES } from "../utils/roles.js";

const authRouter = Router();

authRouter.post("/register", validateRegisterPayload, register);
authRouter.post("/login", validateLoginPayload, login);
authRouter.get(
  "/profile",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.HOSPITAL, ROLES.DONOR, ROLES.BLOOD_BANK, ROLES.OXYGEN_SUPPLIER),
  profile
);

authRouter.get("/pending-users", authenticate, authorizeRoles(ROLES.SUPER_ADMIN), getPendingUsers);
authRouter.patch("/pending-users/:id/approve", authenticate, authorizeRoles(ROLES.SUPER_ADMIN), approvePendingUser);
authRouter.patch("/pending-users/:id/reject", authenticate, authorizeRoles(ROLES.SUPER_ADMIN), rejectPendingUser);
authRouter.get("/users", authenticate, authorizeRoles(ROLES.SUPER_ADMIN), getUsers);
authRouter.get("/users/:id/history", authenticate, authorizeRoles(ROLES.SUPER_ADMIN), getUserHistoryDetails);

export default authRouter;
