import mongoose from "mongoose";

const OXYGEN_STATUS = ["FULL", "IN_USE", "EMPTY", "REFILL_DUE", "LOW_STOCK"];

const oxygenInventorySchema = new mongoose.Schema(
  {
    cylinderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: OXYGEN_STATUS,
      required: true,
      default: "FULL",
      index: true,
    },
    lastRefillDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const OxygenInventory = mongoose.model("OxygenInventory", oxygenInventorySchema);

export { OXYGEN_STATUS };
export default OxygenInventory;
