export const formatTimestamp = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};
