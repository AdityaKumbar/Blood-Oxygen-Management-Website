import BloodInventory from "../models/BloodInventory.js";
import EmergencyRequest from "../models/EmergencyRequest.js";
import User, { ACCOUNT_STATUS } from "../models/User.js";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";
import { ROLE_VALUES } from "../utils/roles.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BLOOD_COMPATIBILITY = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

const normalizeRoleMessage = (value) => value.toLowerCase().replace(/[^a-z0-9+ -]/g, " ");

const extractBloodGroup = (message) => {
  const normalizedMessage = normalizeRoleMessage(message);
  const matchedGroup = BLOOD_GROUPS.find((group) => normalizedMessage.includes(group.toLowerCase()));
  return matchedGroup || null;
};

const getPreviousCalendarMonthRange = (referenceDate = new Date()) => {
  const startOfCurrentMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const start = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth() - 1, 1);
  const end = new Date(startOfCurrentMonth.getTime() - 1);
  return { start, end };
};

const getCurrentCalendarMonthRange = (referenceDate = new Date()) => {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
  return { start, end };
};

const summarizeBloodInventory = async () => {
  const rows = await BloodInventory.aggregate([
    {
      $group: {
        _id: "$bloodGroup",
        totalUnits: { $sum: "$quantity" },
        recordCount: { $sum: 1 },
        lowStockCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "LOW_STOCK"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        bloodGroup: "$_id",
        totalUnits: 1,
        recordCount: 1,
        lowStockCount: 1,
      },
    },
    { $sort: { bloodGroup: 1 } },
  ]);

  const totals = BLOOD_GROUPS.reduce(
    (accumulator, group) => {
      accumulator[group] = {
        totalUnits: 0,
        recordCount: 0,
        lowStockCount: 0,
      };
      return accumulator;
    },
    {}
  );

  for (const row of rows) {
    totals[row.bloodGroup] = {
      totalUnits: row.totalUnits || 0,
      recordCount: row.recordCount || 0,
      lowStockCount: row.lowStockCount || 0,
    };
  }

  return totals;
};

const summarizeMonthlySupply = async (bloodGroup) => {
  const { start, end } = getPreviousCalendarMonthRange();
  const query = {
    requestType: "BLOOD",
    status: "RESOLVED",
    resolvedAt: { $gte: start, $lte: end },
  };

  if (bloodGroup) {
    query.bloodGroup = bloodGroup;
  }

  const rows = await EmergencyRequest.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$bloodGroup",
        totalUnits: { $sum: "$unitsRequired" },
        requestCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        bloodGroup: "$_id",
        totalUnits: 1,
        requestCount: 1,
      },
    },
    { $sort: { bloodGroup: 1 } },
  ]);

  const totals = BLOOD_GROUPS.reduce((accumulator, group) => {
    accumulator[group] = { totalUnits: 0, requestCount: 0 };
    return accumulator;
  }, {});

  for (const row of rows) {
    totals[row.bloodGroup] = {
      totalUnits: row.totalUnits || 0,
      requestCount: row.requestCount || 0,
    };
  }

  const overallTotalUnits = rows.reduce((sum, row) => sum + Number(row.totalUnits || 0), 0);

  return {
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    bloodGroup: bloodGroup || null,
    overallTotalUnits,
    byBloodGroup: totals,
  };
};

const summarizeUsers = async () => {
  const [roleRows, statusRows, totalUsers] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          role: "$_id",
          count: 1,
        },
      },
      { $sort: { role: 1 } },
    ]),
    User.aggregate([
      {
        $group: {
          _id: "$accountStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
      { $sort: { status: 1 } },
    ]),
    User.countDocuments(),
  ]);

  const byRole = ROLE_VALUES.reduce((accumulator, role) => {
    accumulator[role] = 0;
    return accumulator;
  }, {});

  for (const row of roleRows) {
    byRole[row.role] = row.count || 0;
  }

  const byAccountStatus = Object.values(ACCOUNT_STATUS).reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {});

  for (const row of statusRows) {
    byAccountStatus[row.status] = row.count || 0;
  }

  return {
    totalUsers,
    byRole,
    byAccountStatus,
  };
};

const summarizeCurrentMonthRequests = async () => {
  const { start, end } = getCurrentCalendarMonthRange();
  const [createdRows, resolvedRows] = await Promise.all([
    EmergencyRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            requestType: "$requestType",
            status: "$status",
          },
          requestCount: { $sum: 1 },
          oxygenUnits: { $sum: { $ifNull: ["$oxygenUnits", 0] } },
          bloodUnits: { $sum: { $ifNull: ["$unitsRequired", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          requestType: "$_id.requestType",
          status: "$_id.status",
          requestCount: 1,
          oxygenUnits: 1,
          bloodUnits: 1,
        },
      },
    ]),
    EmergencyRequest.aggregate([
      {
        $match: {
          status: "RESOLVED",
          resolvedAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$requestType",
          requestCount: { $sum: 1 },
          oxygenUnits: { $sum: { $ifNull: ["$oxygenUnits", 0] } },
          bloodUnits: { $sum: { $ifNull: ["$unitsRequired", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          requestType: "$_id",
          requestCount: 1,
          oxygenUnits: 1,
          bloodUnits: 1,
        },
      },
    ]),
  ]);

  const summary = {
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    created: {
      totalRequests: 0,
      byType: {
        BLOOD: { requestCount: 0, units: 0 },
        OXYGEN: { requestCount: 0, units: 0 },
      },
      byStatus: {},
    },
    resolved: {
      totalRequests: 0,
      byType: {
        BLOOD: { requestCount: 0, units: 0 },
        OXYGEN: { requestCount: 0, units: 0 },
      },
    },
  };

  for (const row of createdRows) {
    const type = row.requestType || "BLOOD";
    const status = row.status || "UNKNOWN";
    const units = type === "OXYGEN" ? Number(row.oxygenUnits || 0) : Number(row.bloodUnits || 0);

    summary.created.totalRequests += row.requestCount || 0;
    summary.created.byType[type].requestCount += row.requestCount || 0;
    summary.created.byType[type].units += units;
    summary.created.byStatus[status] = (summary.created.byStatus[status] || 0) + (row.requestCount || 0);
  }

  for (const row of resolvedRows) {
    const type = row.requestType || "BLOOD";
    const units = type === "OXYGEN" ? Number(row.oxygenUnits || 0) : Number(row.bloodUnits || 0);

    summary.resolved.totalRequests += row.requestCount || 0;
    summary.resolved.byType[type].requestCount += row.requestCount || 0;
    summary.resolved.byType[type].units += units;
  }

  return summary;
};

const buildSystemPrompt = () => `
You are the Blood Oxygen Management assistant for admin and hospital dashboards.
Use the provided dashboard context to answer operational questions accurately and briefly.
Rules:
- Never invent blood counts, totals, or request totals.
- For blood similarity, explain transfusion compatibility for the requested blood group.
- If a blood group is missing, ask one short clarifying question.
- When discussing "last month", use the supplied previous calendar month data.
- For questions about users, hospitals, donors, or pending accounts, use the userSummary data.
- For questions about oxygen requests, blood requests, request counts, or this month, use requestSummary data.
- If the answer depends on data not present in the context, say so clearly.
- Keep the response concise, practical, and dashboard-friendly.
`;

const buildContextSummary = async (message) => {
  const requestedGroup = extractBloodGroup(message);
  const [inventorySummary, monthlySummary, userSummary, requestSummary] = await Promise.all([
    summarizeBloodInventory(),
    summarizeMonthlySupply(requestedGroup),
    summarizeUsers(),
    summarizeCurrentMonthRequests(),
  ]);

  return {
    requestedGroup,
    compatibility: requestedGroup ? BLOOD_COMPATIBILITY[requestedGroup] : null,
    inventorySummary,
    monthlySummary,
    userSummary,
    requestSummary,
  };
};

const normalizeHistory = (history = []) =>
  history
    .filter((entry) => entry && typeof entry.content === "string" && ["user", "assistant"].includes(entry.role))
    .slice(-8)
    .map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

const buildOllamaUrl = () => {
  const baseUrl = env.ollamaApiUrl.replace(/\/+$/, "");
  return `${baseUrl}/chat`;
};

export const generateAssistantReply = async ({ message, history = [] }) => {
  if (!message?.trim()) {
    throw new AppError("A message is required", 400);
  }

  if (!env.ollamaApiUrl || !env.ollamaModel) {
    throw new AppError("Ollama is not configured on the server", 500);
  }

  const context = await buildContextSummary(message);
  const response = await fetch(buildOllamaUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.ollamaApiKey ? { Authorization: `Bearer ${env.ollamaApiKey}` } : {}),
    },
    body: JSON.stringify({
      model: env.ollamaModel,
      stream: false,
      think: false,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        {
          role: "system",
          content: `Dashboard context:\n${JSON.stringify(context, null, 2)}`,
        },
        ...normalizeHistory(history),
        { role: "user", content: message.trim() },
      ],
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to reach Ollama";
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error || errorBody?.message || errorMessage;
    } catch {
      const fallbackText = await response.text();
      if (fallbackText) {
        errorMessage = fallbackText;
      }
    }
    throw new AppError(errorMessage, 502);
  }

  const data = await response.json();
  const reply = data?.message?.content?.trim();

  if (!reply) {
    throw new AppError("Ollama returned an empty response", 502);
  }

  return {
    reply,
    context,
  };
};
