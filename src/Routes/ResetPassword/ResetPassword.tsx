import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Form, Input, Button, Alert, Card } from "antd";
import {
  LockOutlined,
  SmileOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useResetPassword } from "../../hooks/auth";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const { resetPassword, loading, error, success, isValidLink } = useResetPassword();

  const onFinish = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    // Password confirmation is already validated by the form
    await resetPassword(values.password);
  };

  // Show loading while checking session validity
  if (isValidLink === null) {
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
          <div style={{ textAlign: "center" }}>
            <SmileOutlined style={{ fontSize: 36, color: "#1890ff" }} />
            <Typography
              variant="h6"
              style={{ fontWeight: 500, marginTop: 16 }}
            >
              {t("loading") || "Loading..."}
            </Typography>
          </div>
        </Card>
      </div>
    );
  }

  // Show error if invalid link
  if (!isValidLink) {
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
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <Typography
              variant="h5"
              mb={2}
              style={{ fontWeight: 700, marginTop: 8, color: "#ff4d4f" }}
            >
              {t("invalidResetLink") || "Invalid Reset Link"}
            </Typography>
            <p style={{ color: "#666", marginBottom: 16 }}>
              {t("invalidResetLinkMessage") ||
                "This password reset link is invalid or has expired. Please request a new password reset."}
            </p>
            <Button
              type="primary"
              onClick={() => navigate("/sign-in")}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              {t("backToLogin") || "Back to Login"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
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
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />
            <Typography
              variant="h5"
              mb={2}
              style={{ fontWeight: 700, marginTop: 8, color: "#52c41a" }}
            >
              {t("passwordResetSuccess") || "Password Reset Successful! 🎉"}
            </Typography>
            <p style={{ color: "#666", marginBottom: 16 }}>
              {t("passwordResetSuccessMessage") ||
                "Your password has been successfully reset. You will be redirected to the login page shortly."}
            </p>
            <Button
              type="primary"
              onClick={() => navigate("/sign-in")}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              {t("goToLogin") || "Go to Login"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <SmileOutlined style={{ fontSize: 36, color: "#1890ff" }} />
          <Typography
            variant="h5"
            mb={2}
            style={{ fontWeight: 700, marginTop: 8 }}
          >
            {t("resetPassword")} 🔐
          </Typography>
          <p style={{ color: "#666", marginBottom: 24 }}>
            {t("enterNewPassword") || "Please enter your new password below."}
          </p>
        </div>

        <Form
          name="resetPassword"
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label={t("newPassword") || "New Password"}
            rules={[
              {
                required: true,
                message:
                  t("newPasswordRequired") || "Please enter your new password",
              },
              {
                min: 6,
                message:
                  t("passwordMinLength") ||
                  "Password must be at least 6 characters long",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("newPassword") || "New Password"}
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t("confirmNewPassword") || "Confirm New Password"}
            rules={[
              {
                required: true,
                message:
                  t("confirmPasswordRequired") ||
                  "Please confirm your new password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      t("passwordsDoNotMatch") || "Passwords do not match"
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("confirmNewPassword") || "Confirm New Password"}
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          {error && (
            <Alert
              message={error}
              type="error"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
              style={{ marginTop: 8, borderRadius: 8, fontWeight: 600 }}
            >
              {t("resetPassword") || "Reset Password"}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/sign-in" style={{ color: "#1890ff", fontWeight: 500 }}>
            {t("backToLogin") || "Back to Login"}
          </a>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
