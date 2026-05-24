import mongoose from "mongoose";
import env from "./env.js";

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env");
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};

export default connectDatabase;
