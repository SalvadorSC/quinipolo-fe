export const CONFIDENCE_THRESHOLD_HIGH = 0.7;
export const CONFIDENCE_THRESHOLD_LOW = 0.5;

export const leagueChipStyles: Record<string, { background: string; color: string }> =
  {
    CL: {
      background: "linear-gradient(135deg, #b8860b, #ffd54f)",
      color: "#2d1600",
    },
    DHM: {
      background: "linear-gradient(135deg, #0d47a1, #42a5f5)",
      color: "#e3f2fd",
    },
    DHF: {
      background: "linear-gradient(135deg, #0288d1, #80d8ff)",
      color: "#e3f2fd",
    },
    PDM: {
      background: "linear-gradient(135deg, #b71c1c, #ff5252)",
      color: "#fff5f5",
    },
    PDF: {
      background: "linear-gradient(135deg, #e64a19, #ffab40)",
      color: "#fff8e1",
    },
    SDM: {
      background: "linear-gradient(135deg, #9575cd, #d1c4e9)",
      color: "#2f1b4d",
    },
  };

export const defaultLeagueChipStyle = {
  background: "linear-gradient(135deg, #37474f, #607d8b)",
  color: "#ffffff",
};

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

