import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { supabase } from "../../lib/supabaseClient";
import { Form, Input, Button, Alert, Card, Modal } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useUser } from "../../Context/UserContext/UserContext";
import { getRedirectUrl } from "../../utils/config";
import { trackLogin } from "../../utils/analytics";

const LoginForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [form] = Form.useForm();
  const { updateUser } = useUser();
  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    localStorage.setItem("userId", data?.user?.id ?? "");
    localStorage.setItem("username", data?.user?.email ?? "");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("token", data?.session?.access_token ?? "");
    updateUser({
      userId: data?.user?.id ?? "",
      username: data?.user?.email ?? "",
      token: data?.session?.access_token ?? "",
      isAuthenticated: true,
    });
    setLoading(false);
    if (error) {
      setError(t(error.code!) || error.message);
    } else {
      trackLogin("password");
      navigate("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl("/"),
      },
    });
    setLoading(false);
    if (error) setError(error.message);
  };

  const handleForgotPassword = async () => {
    try {
      const values = await form.validateFields(["email"]);
      const email = values.email;

      if (!email) {
        setError(t("pleaseEnterEmail") || "Please enter your email address");
        return;
      }

      setForgotPasswordLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl("/reset-password"),
      });

      setForgotPasswordLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setShowForgotPasswordModal(true);
        setCooldownTimer(120);
        const interval = setInterval(() => {
          setCooldownTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      setError(t("pleaseEnterEmail") || "Please enter your email address");
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
            disabled={cooldownTimer > 0}
            style={{ fontSize: "14px", color: "#666", borderColor: "#d9d9d9" }}
          >
            {cooldownTimer > 0
              ? `${t("forgotPassword")} (${Math.floor(cooldownTimer / 60)}:${(
                  cooldownTimer % 60
                )
                  .toString()
                  .padStart(2, "0")})`
              : t("forgotPassword")}
          </Button>
        </div>
      </Card>

      <Modal
        title={t("passwordResetEmailSent") || "Password Reset Email Sent"}
        open={showForgotPasswordModal}
        onCancel={() => setShowForgotPasswordModal(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setShowForgotPasswordModal(false)}
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
