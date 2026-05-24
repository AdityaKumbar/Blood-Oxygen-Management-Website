import BloodInventory from "../models/BloodInventory.js";
import OxygenInventory from "../models/OxygenInventory.js";
import User from "../models/User.js";
import { ROLES } from "../utils/roles.js";

const mapAvailability = (status) => {
  if (status === "AVAILABLE" || status === "FULL") return "available_now";
  if (status === "LOW_STOCK" || status === "IN_USE" || status === "REFILL_DUE") return "limited";
  return "unavailable";
};

export const searchResources = async ({ query = "", bloodGroup = "ALL", includeBlood = true, includeOxygen = true, includeHospitals = true, availability = "all" }) => {
  const normalizedQuery = String(query || "").trim();
  const results = [];

  if (includeBlood) {
    const bloodQuery = {};
    if (bloodGroup && bloodGroup !== "ALL") bloodQuery.bloodGroup = bloodGroup;
    if (normalizedQuery) {
      bloodQuery.$or = [
        { storageLocation: { $regex: normalizedQuery, $options: "i" } },
        { bloodGroup: { $regex: normalizedQuery, $options: "i" } },
      ];
    }

    const bloodRows = await BloodInventory.find(bloodQuery).limit(50);
    for (const row of bloodRows) {
      results.push({
        id: `blood-${row._id}`,
        type: "blood",
        name: `Blood Inventory ${row.bloodGroup}`,
        location: row.storageLocation,
        availabilityLabel: mapAvailability(row.status),
        bloodGroups: [row.bloodGroup],
      });
    }
  }

  if (includeOxygen) {
    const oxygenQuery = normalizedQuery
      ? { $or: [{ supplier: { $regex: normalizedQuery, $options: "i" } }, { cylinderId: { $regex: normalizedQuery, $options: "i" } }] }
      : {};
    const oxygenRows = await OxygenInventory.find(oxygenQuery).limit(50);
    for (const row of oxygenRows) {
      results.push({
        id: `oxygen-${row._id}`,
        type: "oxygen",
        name: row.supplier,
        location: row.supplier,
        availabilityLabel: mapAvailability(row.status),
        oxygenUnits: row.capacity,
      });
    }
  }

  if (includeHospitals) {
    const hospitalQuery = { role: ROLES.HOSPITAL };
    if (normalizedQuery) {
      hospitalQuery.name = { $regex: normalizedQuery, $options: "i" };
    }
    const hospitals = await User.find(hospitalQuery).select("_id name");
    for (const hospital of hospitals) {
      results.push({
        id: `hospital-${hospital._id}`,
        type: "hospital",
        name: hospital.name,
        location: hospital.name,
        availabilityLabel: "available_now",
      });
    }
  }

  const filtered = availability === "all" ? results : results.filter((item) => item.availabilityLabel === availability);
  return filtered;
};
