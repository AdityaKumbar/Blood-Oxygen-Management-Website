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

if (!MONGO_URI) {
  console.error("MONGO_URI not defined in .env file");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("--- Users in MongoDB ---");
    const users = await User.find({});
    for (const u of users) {
      console.log(`User: ID: ${u._id}, Role: ${u.role}, Name: ${u.name || u.fullName}, Email: ${u.email}, Lat: ${u.latitude}, Lng: ${u.longitude}, Address: ${u.address}`);
    }

    console.log("\n--- Emergency Requests in MongoDB ---");
    const reqs = await EmergencyRequest.find({});
    for (const r of reqs) {
      console.log(`Request: ID: ${r._id}, Hospital: ${r.hospital}, Patient: ${r.patientName}, Type: ${r.requestType}, BloodGroup: ${r.bloodGroup}, Status: ${r.status}, CreatedBy: ${r.createdBy}`);
    }
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
