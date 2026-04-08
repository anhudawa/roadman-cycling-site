// Chart color constants
export const chartColors = {
  coral: "#E8836B",
  purple: "#6B4FA0",
  green: "#4ADE80",
  blue: "#60A5FA",
  amber: "#FBBF24",
  charcoal: "#1C1C1E",
  offWhite: "#F5F0EB",
} as const;

// Shared tooltip styles for dark theme
export const tooltipStyles = {
  contentStyle: {
    backgroundColor: "#2A2A2E",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#F5F0EB",
    fontSize: "13px",
  },
  labelStyle: {
    color: "#999",
    fontSize: "11px",
    marginBottom: "4px",
  },
  cursor: {
    stroke: "rgba(255, 255, 255, 0.1)",
  },
} as const;

// Shared grid styles for dark theme
export const gridStyles = {
  strokeDasharray: "3 3",
  stroke: "rgba(255, 255, 255, 0.06)",
  vertical: false,
} as const;
