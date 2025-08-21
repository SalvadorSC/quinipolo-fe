import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { supabase } from "../../lib/supabaseClient";
import { Form, Input, Button, Alert, Card } from "antd";
import {
  LockOutlined,
  SmileOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();

  // Check if we have the necessary tokens from the URL
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const type = searchParams.get("type");

  useEffect(() => {
    // If we have tokens and this is a password recovery, set the session
    if (accessToken && refreshToken && type === "recovery") {
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ error }) => {
          if (error) {
            setError(
              t("invalidResetLink") ||
                "Invalid or expired reset link. Please request a new password reset."
            );
          }
        });
    } else if (!accessToken || !refreshToken || type !== "recovery") {
      setError(
        t("invalidResetLink") ||
          "Invalid or expired reset link. Please request a new password reset."
      );
    }
  }, [accessToken, refreshToken, type, t]);

  const onFinish = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      setError(t("passwordsDoNotMatch") || "Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Sign out the user after successful password reset
        await supabase.auth.signOut();
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/sign-in");
        }, 3000);
      }
    } catch (error) {
      setError(
        t("passwordResetError") ||
          "An error occurred while resetting your password"
      );
    } finally {
      setLoading(false);
    }
  };

  // Show error if invalid link
  if (error && (!accessToken || !refreshToken || type !== "recovery")) {
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
