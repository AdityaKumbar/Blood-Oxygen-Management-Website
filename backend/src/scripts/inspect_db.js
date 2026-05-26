import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import EmergencyRequest from "../models/EmergencyRequest.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!\n");

    const requests = await EmergencyRequest.find({})
      .populate("createdBy")
      .sort({ createdAt: -1 });

    console.log(`--- FOUND ${requests.length} EMERGENCY REQUESTS ---`);
    requests.forEach((req, i) => {
      console.log(`[Request #${i + 1}]`);
      console.log(`ID: ${req._id}`);
      console.log(`Hospital Field: ${req.hospital}`);
      console.log(`Patient Name: ${req.patientName}`);
      console.log(`Status: ${req.status}`);
      console.log(`CreatedBy:`, req.createdBy ? {
        id: req.createdBy._id,
        name: req.createdBy.name,
        role: req.createdBy.role,
        latitude: req.createdBy.latitude,
        longitude: req.createdBy.longitude,
        address: req.createdBy.address
      } : "NULL");
      console.log("------------------------------------------");
    });

  } catch (error) {
    console.error("Error inspecting database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
