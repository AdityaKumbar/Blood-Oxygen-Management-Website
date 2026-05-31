import dotenv from "dotenv";

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientOrigins: (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  ollamaApiUrl: process.env.OLLAMA_API_URL || "https://ollama.com/api",
  ollamaApiKey: process.env.OLLAMA_API_KEY || "",
  ollamaModel: process.env.OLLAMA_MODEL || "gpt-oss:120b",
};

export default env;
