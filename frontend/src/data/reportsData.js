export const analyticsSummaryCards = [
  { id: "bloodUsed", label: "Blood Units Used", value: "18,240", change: "+11.4%", tone: "rose" },
  { id: "donorParticipation", label: "Donor Participation", value: "6,182", change: "+6.8%", tone: "red" },
  { id: "oxygenDispatch", label: "Oxygen Dispatches", value: "2,904", change: "+9.1%", tone: "amber" },
  { id: "resolvedRequests", label: "Resolved Emergencies", value: "1,122", change: "+13.3%", tone: "rose" },
];

export const bloodUsageMonthly = [
  { month: "Jan", units: 1220 },
  { month: "Feb", units: 1310 },
  { month: "Mar", units: 1280 },
  { month: "Apr", units: 1390 },
  { month: "May", units: 1480 },
  { month: "Jun", units: 1520 },
  { month: "Jul", units: 1610 },
  { month: "Aug", units: 1580 },
  { month: "Sep", units: 1660 },
  { month: "Oct", units: 1710 },
  { month: "Nov", units: 1750 },
  { month: "Dec", units: 1830 },
];

export const donationMonthly = [
  { month: "Jan", donors: 420 },
  { month: "Feb", donors: 450 },
  { month: "Mar", donors: 480 },
  { month: "Apr", donors: 460 },
  { month: "May", donors: 500 },
  { month: "Jun", donors: 530 },
  { month: "Jul", donors: 560 },
  { month: "Aug", donors: 590 },
  { month: "Sep", donors: 610 },
  { month: "Oct", donors: 640 },
  { month: "Nov", donors: 670 },
  { month: "Dec", donors: 710 },
];

export const oxygenDemandMonthly = [
  { month: "Jan", icu: 72, emergency: 84 },
  { month: "Feb", icu: 70, emergency: 86 },
  { month: "Mar", icu: 74, emergency: 90 },
  { month: "Apr", icu: 76, emergency: 92 },
  { month: "May", icu: 79, emergency: 95 },
  { month: "Jun", icu: 81, emergency: 96 },
  { month: "Jul", icu: 84, emergency: 98 },
  { month: "Aug", icu: 82, emergency: 97 },
  { month: "Sep", icu: 86, emergency: 101 },
  { month: "Oct", icu: 88, emergency: 103 },
  { month: "Nov", icu: 90, emergency: 105 },
  { month: "Dec", icu: 92, emergency: 108 },
];

export const emergencyAnalytics = [
  { name: "Critical", value: 29 },
  { name: "High", value: 38 },
  { name: "Moderate", value: 24 },
  { name: "Low", value: 9 },
];

export const monthlyTrends = [
  { label: "Avg. Approval Time", value: "11 min", trend: "-2 min vs last month" },
  { label: "Blood Utilization Efficiency", value: "91%", trend: "+3.1% vs last month" },
  { label: "Donor Conversion", value: "74%", trend: "+4.5% vs last month" },
  { label: "Emergency SLA Compliance", value: "96%", trend: "+1.8% vs last month" },
];

export const insightItems = [
  "Critical emergency requests are highest between 7 PM and 11 PM in urban clusters.",
  "O+ and B+ blood groups account for nearly 58% of monthly consumption.",
  "Supplier response time improved after predictive refill scheduling rollout.",
  "Donor engagement campaigns increased repeat donation participation by 12%.",
];
