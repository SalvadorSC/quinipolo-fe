import { useSearchParams } from "react-router-dom";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Form, Input, Button, Alert, Card, Modal } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useLogin, usePasswordReset } from "../../hooks/auth";

const LoginForm = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  // Use custom hooks for authentication
  const { login, loginWithGoogle, loading, error: loginError } = useLogin();
  const {
    requestPasswordReset,
    loading: forgotPasswordLoading,
    error: resetError,
    showSuccessModal,
    closeSuccessModal,
    cooldownTimer,
    formatCooldownTime,
    canSendReset,
  } = usePasswordReset();

  // Combined error from both hooks
  const error = loginError || resetError;

  const onFinish = async (values: { email: string; password: string }) => {
    const returnUrl = searchParams.get("returnUrl");
    await login(values, returnUrl);
  };

  const handleGoogleSignIn = async () => {
    const returnUrl = searchParams.get("returnUrl");
    await loginWithGoogle(returnUrl);
  };

  const handleForgotPassword = async () => {
    try {
      const values = await form.validateFields(["email"]);
      await requestPasswordReset(values.email);
    } catch (validationError) {
      // Form validation failed - email field is empty or invalid
    }
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
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <SmileOutlined style={{ fontSize: 36, color: "#1890ff" }} />
          <Typography
            variant="h5"
            mb={2}
            style={{ fontWeight: 700, marginTop: 8 }}
          >
            {t("signIn")} 🎉
          </Typography>
        </div>
        <Form name="login" form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label={t("email")}
            rules={[
              { required: true, message: t("email") + " " + t("isRequired") },
            ]}
          >
            <Input
              type="email"
              prefix={<MailOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("email")}
              size="large"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={t("password")}
            rules={[
              {
                required: true,
                message: t("password") + " " + t("isRequired"),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("password")}
              size="large"
              autoComplete="current-password"
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
              {t("signIn")}
            </Button>
          </Form.Item>
        </Form>
        <Button
          onClick={handleGoogleSignIn}
          icon={<GoogleOutlined />}
          type="default"
          block
          size="large"
          style={{
            marginTop: 8,
            borderRadius: 8,
            fontWeight: 600,
            background: "#fff",
            color: "#4285F4",
            border: "1px solid #e0e0e0",
            transition: "background 0.2s, color 0.2s",
          }}
          // disabled={true}
          disabled={loading}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e8f0fe")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
        >
          {t("signIn")} Google
        </Button>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/signup" style={{ color: "#1890ff", fontWeight: 500 }}>
            {t("noAccountSignUpHere") || "No account? Sign up here."}
          </a>
        </div>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Button
            type="default"
            size="small"
            onClick={handleForgotPassword}
            loading={forgotPasswordLoading}
            disabled={!canSendReset}
            style={{ fontSize: "14px", color: "#666", borderColor: "#d9d9d9" }}
          >
            {!canSendReset
              ? `${t("forgotPassword")} (${formatCooldownTime()})`
              : t("forgotPassword")}
          </Button>
        </div>
      </Card>

      <Modal
        title={t("passwordResetEmailSent") || "Password Reset Email Sent"}
        open={showSuccessModal}
        onCancel={closeSuccessModal}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={closeSuccessModal}
          >
            {t("ok") || "OK"}
          </Button>,
        ]}
        centered
      >
        <div style={{ textAlign: "center", margin: 16 }}>
          <p>
            {t("passwordResetEmailSentMessage") ||
              "A password reset email has been sent to your email address."}
          </p>
          <p>
            {t("checkYourInbox") ||
              "Please check your inbox and follow the instructions to reset your password."}
          </p>
          <p style={{ marginTop: 16, fontWeight: "bold", color: "#ff4d4f" }}>
            {t("cooldownMessage") ||
              "You won't be able to send another password reset email for 2 minutes."}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default LoginForm;
