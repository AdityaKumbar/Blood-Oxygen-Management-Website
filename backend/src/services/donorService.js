import DonorProfile from "../models/DonorProfile.js";

const RECOVERY_DAYS = 90;

const toEligibility = (lastDonatedAt) => {
  if (!lastDonatedAt) {
    return { isEligible: true, nextEligibleDate: null, reason: "" };
  }

  const nextEligible = new Date(lastDonatedAt);
  nextEligible.setDate(nextEligible.getDate() + RECOVERY_DAYS);
  const isEligible = nextEligible <= new Date();

  return {
    isEligible,
    nextEligibleDate: nextEligible.toISOString(),
    reason: isEligible ? "" : "Minimum recovery gap is still active.",
  };
};

const toDonorResponse = (profile) => ({
  id: profile.userId.toString(),
  isRegistered: true,
  isAvailable: profile.isAvailable,
  eligibility: toEligibility(profile.lastDonatedAt),
  bloodGroup: profile.bloodGroup,
  city: profile.city,
  history: [],
});

export const getDonorProfile = async (userId) => {
  const profile = await DonorProfile.findOne({ userId });
  if (!profile) {
    return {
      id: userId.toString(),
      isRegistered: false,
      isAvailable: false,
      eligibility: { isEligible: true, nextEligibleDate: null, reason: "" },
      history: [],
    };
  }

  return toDonorResponse(profile);
};

export const registerDonorProfile = async (userId, payload) => {
  const profile = await DonorProfile.findOneAndUpdate(
    { userId },
    {
      userId,
      bloodGroup: payload.bloodGroup,
      city: payload.city,
      isAvailable: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return toDonorResponse(profile);
};

export const setDonorAvailability = async (userId, isAvailable) => {
  const profile = await DonorProfile.findOneAndUpdate(
    { userId },
    { isAvailable: Boolean(isAvailable) },
    { new: true }
  );

  if (!profile) {
    return {
      id: userId.toString(),
      isRegistered: false,
      isAvailable: false,
      eligibility: { isEligible: true, nextEligibleDate: null, reason: "" },
      history: [],
    };
  }

  return toDonorResponse(profile);
};

export const getDonorHistory = async () => {
  return [];
};
