import http from "http";
import express from "express";
import cors from "cors";
import { Server as SocketServer } from "socket.io";
import env from "./config/env.js";
import connectDatabase from "./config/database.js";
import apiRouter from "./routes/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import registerSocketHandlers from "./sockets/index.js";
import dns from "dns";

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

const app = express();
const server = http.createServer(app);
const allowedOrigins = env.clientOrigins;

const corsOriginValidator = (origin, callback) => {
  if (!origin) {
    callback(null, true);
    return;
  }

  const isAllowed = allowedOrigins.includes(origin);
  callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
};

const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

registerSocketHandlers(io);
app.set("io", io);

app.use(cors({ origin: corsOriginValidator, credentials: true }));
app.use(express.json());
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
