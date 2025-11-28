export const CONFIDENCE_THRESHOLD_HIGH = 0.7;
export const CONFIDENCE_THRESHOLD_LOW = 0.5;

// League chip styles have been moved to utils/leagueChipStyles.ts

export const primaryActionStyles = {
  background: "linear-gradient(135deg, #b8860b, #ffd54f)",
  color: "#3e2723",
  borderRadius: 999,
  fontWeight: 700,
  px: 3,
  "&:hover": {
    background: "linear-gradient(135deg, #a07007, #ffca28)",
    color: "#3e2723",
  },
  "&.Mui-disabled": {
    color: "rgba(62,39,35,0.6)",
    background:
      "linear-gradient(135deg, rgba(184,134,11,0.3), rgba(255,213,79,0.3))",
  },
};

export const secondaryActionStyles = {
  borderRadius: 999,
  fontWeight: 600,
  px: 2.5,
  color: "#4527a0",
  border: "2px solid #4527a0",
  "&:hover": {
    borderColor: "#311b92",
    color: "#311b92",
    backgroundColor: "rgba(69,39,160,0.05)",
  },
};

