import mongoose from "mongoose";
import { ROLE_VALUES, ROLES } from "../utils/roles.js";

export const ACCOUNT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const ACCOUNT_STATUS_VALUES = Object.values(ACCOUNT_STATUS);

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.HOSPITAL,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: "",
    },
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUS_VALUES,
      default: ACCOUNT_STATUS.PENDING,
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
