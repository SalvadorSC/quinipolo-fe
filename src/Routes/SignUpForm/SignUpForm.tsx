import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../LoginForm/LoginForm.module.scss";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { useTheme } from "../../Context/ThemeContext/ThemeContext";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { supabase } from "../../lib/supabaseClient";
import { Form, Input, Button, Alert, Card } from "antd";
import { apiPost } from "../../utils/apiUtils";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  IdcardOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
    username: string;
    fullName: string;
  }) => {
    setLoading(true);
    setError(null);
    const { email, password, username, fullName } = values;

    try {
      // Sign up with Supabase auth first
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Then call backend API to create profile and add to leagues
      try {
        await apiPost("/api/auth/signup", {
          email,
          username,
          fullName,
          leagues: ["global"],
          userId: data.user?.id, // Pass the user ID from Supabase auth
        });
      } catch (backendError: any) {
        // Handle backend validation errors
        if (backendError?.response?.data?.error) {
          const errorMessage = backendError.response.data.error;
          if (
            errorMessage.includes("quinipolo") ||
            errorMessage.includes("already exists")
          ) {
            setError(errorMessage);
            setLoading(false);
            return;
          }
        }
        console.warn(
          "Backend signup failed, but auth was successful:",
          backendError
        );
        // Don't fail the signup if backend call fails, as the profile will be created when user first accesses it
      }

      setLoading(false);
      navigate("/email-confirmation");
    } catch (error: any) {
      setLoading(false);

      // Handle backend validation errors
      if (error?.response?.data?.error) {
        const errorMessage = error.response.data.error;
        if (
          errorMessage.includes("quinipolo") ||
          errorMessage.includes("already exists")
        ) {
          setError(errorMessage);
          return;
        }
      }

      setError(error instanceof Error ? error.message : "An error occurred");
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
            {t("signUp")} 🎉
          </Typography>
        </div>
        <Form name="signup" onFinish={onFinish} layout="vertical">
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
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            name="username"
            label={t("username")}
            rules={[
              {
                required: true,
                message: t("username") + " " + t("isRequired"),
              },
              {
                min: 3,
                message: "Username must be at least 3 characters long",
              },
              {
                max: 15,
                message: "Username cannot exceed 15 characters",
              },
              {
                validator: (_, value) => {
                  if (value && value.toLowerCase().includes("quinipolo")) {
                    return Promise.reject(
                      new Error(t("usernameSecurityError"))
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("username")}
              size="large"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="fullName"
            label={t("fullName")}
            rules={[
              {
                required: true,
                message: t("fullName") + " " + t("isRequired"),
              },
            ]}
          >
            <Input
              prefix={<IdcardOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("fullName")}
              size="large"
              autoComplete="name"
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
              disabled={loading}
              loading={loading}
              size="large"
              style={{ marginTop: 8, borderRadius: 8, fontWeight: 600 }}
            >
              {t("signUp")}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/sign-in" style={{ color: "#1890ff", fontWeight: 500 }}>
            {t("alreadyHaveAccountLogin") ||
              "Already have an account? Log in here."}
          </a>
        </div>
      </Card>
    </div>
  );
};

export default SignUpForm;
