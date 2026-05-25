import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";
import EmergencyRequest from "../models/EmergencyRequest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const hospitals = await User.find({ role: "HOSPITAL" });
    const hospitalIds = hospitals.map(h => h._id);

    console.log(`Searching emergency requests created by hospital IDs: ${hospitalIds.join(", ")}`);
    const requests = await EmergencyRequest.find({ createdBy: { $in: hospitalIds } });
    console.log(`Found ${requests.length} emergency requests in the database.`);

    for (const req of requests) {
      console.log(`Updating request ${req._id} patient ${req.patientName}`);
      req.hospital = "KLE Hospital";
      req.contactNumber = "98856263001";
      await req.save();
    }

    console.log("All emergency requests successfully updated to match KLE Hospital!");
  } catch (error) {
    console.error("Error updating requests:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
