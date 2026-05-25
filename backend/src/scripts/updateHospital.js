import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from backend root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI not defined in .env file");
  process.exit(1);
}

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    // Let's find all users with role HOSPITAL
    const hospitals = await User.find({ role: "HOSPITAL" });
    console.log(`Found ${hospitals.length} hospital accounts in the database.`);

    if (hospitals.length === 0) {
      console.log("No hospital accounts found to update.");
      process.exit(0);
    }

    for (const hosp of hospitals) {
      console.log(`Updating hospital: ${hosp.name} (${hosp.email})`);
      
      hosp.name = "KLE Hospital";
      hosp.phone = "98856263001";
      hosp.address = "KLE's Dr. Prabhakar Kore Hospital & Medical Research Centre, Nehru Nagar, Belagavi, Karnataka 590010";
      hosp.latitude = 15.887074;
      hosp.longitude = 74.519596;
      hosp.accountStatus = "APPROVED";
      hosp.approvedAt = new Date();

      await hosp.save();
      console.log(`Successfully updated ${hosp.email} to KLE Hospital!`);
    }

    console.log("All hospital profiles successfully synchronized in MongoDB!");
  } catch (error) {
    console.error("Error updating hospital details in MongoDB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
