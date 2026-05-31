import { Router } from "express";
import authRouter from "./authRoutes.js";
import bloodRouter from "./bloodRoutes.js";
import oxygenRouter from "./oxygenRoutes.js";
import emergencyRequestRouter from "./emergencyRequestRoutes.js";
import donorRouter from "./donorRoutes.js";
import searchRouter from "./searchRoutes.js";
import assistantRouter from "./assistantRoutes.js";
import { successResponse } from "../utils/response.js";

const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
  return successResponse(res, 200, "Service is healthy", {
    service: "healthcare-emergency-backend",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/blood", bloodRouter);
apiRouter.use("/oxygen", oxygenRouter);
apiRouter.use("/emergency-requests", emergencyRequestRouter);
apiRouter.use("/donor", donorRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/assistant", assistantRouter);

export default apiRouter;
