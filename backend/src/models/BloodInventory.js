import mongoose from "mongoose";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STOCK_STATUS = ["AVAILABLE", "LOW_STOCK", "EXPIRED"];

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    storageLocation: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: STOCK_STATUS,
      default: "AVAILABLE",
      index: true,
    },
  },
  { timestamps: true }
);

const BloodInventory = mongoose.model("BloodInventory", bloodInventorySchema);

export { BLOOD_GROUPS, STOCK_STATUS };
export default BloodInventory;
