import mongoose from "mongoose";

export const DONATION_TYPES = ["WHOLE_BLOOD", "PLASMA", "PLATELETS"];

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    donatedAt: {
      type: Date,
      required: true,
      index: true,
    },
    donationType: {
      type: String,
      enum: DONATION_TYPES,
      default: "WHOLE_BLOOD",
    },
    units: {
      type: Number,
      min: 1,
      default: 1,
    },
    emergencyRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyRequest",
      default: null,
      sparse: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
