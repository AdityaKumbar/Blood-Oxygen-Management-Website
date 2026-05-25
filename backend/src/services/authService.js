import bcrypt from "bcrypt";
import User, { ACCOUNT_STATUS } from "../models/User.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import AppError from "../utils/AppError.js";
import { ROLES } from "../utils/roles.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  avatarUrl: user.avatarUrl || "",
  role: user.role,
  accountStatus: user.accountStatus,
  approvedAt: user.approvedAt,
  rejectionReason: user.rejectionReason,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = async ({ name, email, phone, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const shouldAutoApprove = role === ROLES.SUPER_ADMIN || role === ROLES.DONOR;

  const user = await User.create({
    name,
    email,
    phone: phone ? String(phone).trim() : "",
    password: hashedPassword,
    role,
    accountStatus: shouldAutoApprove ? ACCOUNT_STATUS.APPROVED : ACCOUNT_STATUS.PENDING,
    approvedAt: shouldAutoApprove ? new Date() : null,
  });

  if (user.accountStatus !== ACCOUNT_STATUS.APPROVED) {
    return {
      user: toPublicUser(user),
      accessToken: null,
      refreshToken: null,
    };
  }

  const tokenPayload = { sub: user._id.toString(), role: user.role };

  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
  };
};

export const updateUserProfile = async (userId, { name, phone, avatarUrl }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (name !== undefined) {
    user.name = String(name).trim();
  }

  if (phone !== undefined) {
    user.phone = String(phone).trim();
  }

  if (avatarUrl !== undefined) {
    user.avatarUrl = String(avatarUrl).trim();
  }

  await user.save();
  return toPublicUser(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.accountStatus === ACCOUNT_STATUS.PENDING) {
    throw new AppError("Account approval is pending with admin", 403);
  }

  if (user.accountStatus === ACCOUNT_STATUS.REJECTED) {
    const reasonSuffix = user.rejectionReason ? `: ${user.rejectionReason}` : "";
    throw new AppError(`Account request was rejected${reasonSuffix}`, 403);
  }

  const tokenPayload = { sub: user._id.toString(), role: user.role };

  return {
    user: toPublicUser(user),
    accessToken: generateAccessToken(tokenPayload),
    refreshToken: generateRefreshToken(tokenPayload),
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toPublicUser(user);
};

export const listPendingUsers = async () => {
  const users = await User.find({
    accountStatus: ACCOUNT_STATUS.PENDING,
    role: { $ne: ROLES.SUPER_ADMIN },
  }).sort({ createdAt: 1 });

  return users.map(toPublicUser);
};

export const approveUserAccount = async (targetUserId, adminUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw new AppError("Super admin account cannot be modified", 400);
  }

  user.accountStatus = ACCOUNT_STATUS.APPROVED;
  user.approvedAt = new Date();
  user.approvedBy = adminUserId;
  user.rejectionReason = "";
  await user.save();

  return toPublicUser(user);
};

export const rejectUserAccount = async (targetUserId, adminUserId, rejectionReason = "") => {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw new AppError("Super admin account cannot be modified", 400);
  }

  user.accountStatus = ACCOUNT_STATUS.REJECTED;
  user.approvedAt = null;
  user.approvedBy = adminUserId;
  user.rejectionReason = rejectionReason.trim();
  await user.save();

  return toPublicUser(user);
};

export const listUsers = async ({ role = "", status = "", search = "" }) => {
  const query = {
    role: { $ne: ROLES.SUPER_ADMIN },
  };

  if (role) query.role = role;
  if (status) query.accountStatus = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 });
  return users.map(toPublicUser);
};

export const getUserHistory = async (targetUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isHospital = user.role === ROLES.HOSPITAL;
  const historyQuery = isHospital
    ? { $or: [{ createdBy: user._id }, { hospital: user.name }] }
    : { createdBy: user._id };

  const emergencyRequests = await EmergencyRequest.find(historyQuery)
    .sort({ createdAt: -1 })
    .limit(20);

  return {
    user: toPublicUser(user),
    emergencyRequests: emergencyRequests.map((item) => (item.toObject ? item.toObject() : item)),
  };
};
