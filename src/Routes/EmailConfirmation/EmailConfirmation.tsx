import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Context/ThemeContext/ThemeContext";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Card, Button } from "antd";
import {
  MailOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import MenuBar from "../../Components/MenuBar/MenuBar";

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleBackToLogin = () => {
    navigate("/sign-in");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MenuBar />
      <Card
        style={{
          width: 380,
          maxWidth: "95vw",
          borderRadius: 24,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          background: "rgba(255,255,255,0.95)",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <CheckCircleOutlined
            style={{
              fontSize: 48,
              color: "#52c41a",
              marginBottom: 16,
            }}
          />
          <Typography
            variant="h5"
            mb={2}
            style={{ fontWeight: 700, marginBottom: 16 }}
          >
            {t("checkYourEmail") || "Check Your Email"}
          </Typography>
          <Typography
            variant="body1"
            style={{
              color: "#666",
              lineHeight: 1.6,
              marginBottom: 8,
            }}
          >
            {t("emailConfirmationSent") ||
              "We've sent a confirmation email to your inbox. Please check your email and click the confirmation link to activate your account."}
          </Typography>
          <Typography
            variant="body2"
            style={{
              color: "#999",
              fontSize: "14px",
              marginTop: 16,
            }}
          >
            {t("emailConfirmationNote") ||
              "Didn't receive the email? Check your spam folder or try signing up again."}
          </Typography>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToLogin}
            size="large"
            style={{
              borderRadius: 8,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {t("backToLogin") || "Back to Login"}
          </Button>

          <div style={{ marginTop: 20 }}>
            <Typography
              variant="body2"
              style={{
                color: "#666",
                fontSize: "14px",
              }}
            >
              {t("emailConfirmationHelp") ||
                "Need help? Contact our support team."}
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
