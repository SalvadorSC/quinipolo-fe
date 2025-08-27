import React from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useUser } from "../../Context/UserContext/UserContext";
import { isSystemAdmin } from "../../utils/moderatorUtils";

interface AdminPanelProps {
  title?: string;
  description?: string;
  showAllLeaguesButton?: boolean;
  showManagedLeaguesButton?: boolean;
  showCustomButtons?: React.ReactNode;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  title = "🛠️ System Administrator Panel",
  description = "Administrative functions for managing all leagues.",
  showAllLeaguesButton = false,
  showManagedLeaguesButton = true,
  showCustomButtons,
}) => {
  const navigate = useNavigate();
  const { userData } = useUser();

  // Only render if user is system admin
  if (!isSystemAdmin(userData.role)) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: "#f5f5f5",
        border: "2px solid #1976d2",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#1976d2" }}>{title}</h3>
      <p
        style={{
          margin: "0 0 15px 0",
          fontSize: "14px",
          color: "#666",
        }}
      >
        {description}
      </p>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {showAllLeaguesButton && (
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={() => navigate("/crear-quinipolo?allLeagues=true")}
            sx={{ mb: 1 }}
          >
            Create Quinipolo for All Leagues
          </LoadingButton>
        )}

        {showManagedLeaguesButton && (
          <LoadingButton
            variant="contained"
            color="secondary"
            onClick={() => navigate("/crear-quinipolo?managedLeagues=true")}
            sx={{ mb: 1 }}
          >
            Create Quinipolo for Managed Leagues Only
          </LoadingButton>
        )}

        {showCustomButtons}

        <span
          style={{
            fontSize: "12px",
            color: "#999",
            display: "block",
          }}
        >
          Only visible to system administrators
        </span>
      </Box>
    </Paper>
  );
};

export default AdminPanel;
