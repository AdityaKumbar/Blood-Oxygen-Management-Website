import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { listEmergencyRequests } from "../services/emergencyRequestService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not defined");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    // Simulate listing emergency requests for the app
    const result = await listEmergencyRequests({ forApp: "true", limit: 50 }, { role: "DONOR" });
    const venugram = result.items.find(x => x.hospital.toLowerCase().includes("venugram"));
    console.log("--- Venugram Request in JSON Feed Output ---");
    console.log(JSON.stringify(venugram, null, 2));
  } catch (error) {
    console.error("Error in API check:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
