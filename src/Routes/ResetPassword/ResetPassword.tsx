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
              {t("loading")}
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
              {t("invalidResetLink")}
            </Typography>
            <p style={{ color: "#666", marginBottom: 16 }}>
              {t("invalidResetLinkMessage")}
            </p>
            <Button
              type="primary"
              onClick={() => navigate("/sign-in")}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              {t("backToLogin")}
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
              {t("passwordResetSuccess")}
            </Typography>
            <p style={{ color: "#666", marginBottom: 16 }}>
              {t("passwordResetSuccessMessage")}
            </p>
            <Button
              type="primary"
              onClick={() => navigate("/sign-in")}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              {t("goToLogin")}
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
            {t("enterNewPassword")}
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
            label={t("newPassword")}
            rules={[
              {
                required: true,
                message:
                  t("newPasswordRequired"),
              },
              {
                min: 6,
                message:
                  t("passwordMinLength"),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("newPassword")}
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t("confirmNewPassword")}
            rules={[
              {
                required: true,
                message:
                  t("confirmPasswordRequired"),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      t("passwordsDoNotMatch")
                    )
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("confirmNewPassword")}
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
              {t("resetPassword")}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/sign-in" style={{ color: "#1890ff", fontWeight: 500 }}>
            {t("backToLogin")}
          </a>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
