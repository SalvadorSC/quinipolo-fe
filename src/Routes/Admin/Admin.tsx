import React from "react";
import { Paper, Box, Typography, Grid } from "@mui/material";
import AdminPanel from "../../Components/AdminPanel/AdminPanel";
import { useUser } from "../../Context/UserContext/UserContext";
import { useTranslation } from "react-i18next";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const Admin: React.FC = () => {
  const { userData } = useUser();
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            mb: 3,
          }}
        >
          <AdminPanelSettingsIcon
            sx={{ fontSize: 40, color: "#1976d2", mr: 2 }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: "#1976d2", fontWeight: "bold" }}
            >
              {t("systemAdministration")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("adminWelcome", { username: userData.username })}
            </Typography>
          </Box>
        </Box>

        {/* Admin Panel Component */}
        <AdminPanel
          title={`🛠️ ${t("adminQuinipoloManagement")}`}
          description={t("adminQuinipoloManagementDesc")}
        />

        {/* System Information */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            mt: 3,
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: "#495057" }}>
            {t("systemInformation")}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>{t("userId")}:</strong> {userData.userId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t("userRole")}:</strong> {userData.role}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>{t("userLeagues")}:</strong>{" "}
                {userData.leagues?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{t("userEmail")}:</strong> {userData.emailAddress}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Paper>
    </div>
  );
};

export default Admin;
