import mongoose from "mongoose";

const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const REQUEST_STATUS = ["PENDING", "APPROVED", "FORWARDED_TO_APP", "REJECTED", "ASSIGNED", "RESOLVED"];
const REQUEST_TYPES = ["BLOOD", "OXYGEN"];

const emergencyRequestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: false,
      trim: true,
    },
    isInventory: {
      type: Boolean,
      default: false,
    },
    requestType: {
      type: String,
      enum: REQUEST_TYPES,
      default: "BLOOD",
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      index: true,
      default: null,
    },
    oxygenUnits: {
      type: Number,
      min: 1,
      default: null,
    },
    unitsRequired: {
      type: Number,
      min: 1,
      default: 1,
    },
    hospital: {
      type: String,
      required: false,
      trim: true,
      index: true,
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "MEDIUM",
      index: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUS,
      default: "PENDING",
      index: true,
    },
    assignedDonor: {
      type: String,
      trim: true,
      default: "",
    },
    assignedDonorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    forwardedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const EmergencyRequest = mongoose.model("EmergencyRequest", emergencyRequestSchema);

export { PRIORITY_LEVELS, REQUEST_STATUS, REQUEST_TYPES };
export default EmergencyRequest;
