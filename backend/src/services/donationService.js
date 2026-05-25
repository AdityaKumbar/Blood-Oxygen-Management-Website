import Donation from "../models/Donation.js";
import DonorProfile from "../models/DonorProfile.js";
import User from "../models/User.js";
import { ROLES } from "../utils/roles.js";

const mapDonationToResponse = (doc) => ({
  id: doc._id.toString(),
  donatedAt: doc.donatedAt.toISOString(),
  location: doc.location,
  units: doc.units,
  donationType: doc.donationType,
});

export const getDonorHistory = async (userId) => {
  const donations = await Donation.find({ userId }).sort({ donatedAt: -1 });
  return donations.map(mapDonationToResponse);
};

export const resolveDonorUserId = async (record) => {
  if (record.assignedDonorUserId) {
    return record.assignedDonorUserId;
  }
  if (!record.assignedDonor?.trim()) {
    return null;
  }
  const user = await User.findOne({ name: record.assignedDonor.trim(), role: ROLES.DONOR });
  return user?._id ?? null;
};

export const recordDonationFromEmergency = async (request, userId) => {
  if (!userId || request.requestType !== "BLOOD") {
    return null;
  }

  const existing = await Donation.findOne({ emergencyRequestId: request._id });
  if (existing) {
    return existing;
  }

  const donatedAt = request.resolvedAt || new Date();
  const donation = await Donation.create({
    userId,
    location: request.hospital,
    donatedAt,
    units: request.unitsRequired > 0 ? request.unitsRequired : 1,
    donationType: "WHOLE_BLOOD",
    emergencyRequestId: request._id,
  });

  await DonorProfile.findOneAndUpdate({ userId }, { lastDonatedAt: donatedAt });

  return donation;
};
