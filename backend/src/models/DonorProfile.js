import mongoose from "mongoose";

const donorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastDonatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const DonorProfile = mongoose.model("DonorProfile", donorProfileSchema);

export default DonorProfile;
