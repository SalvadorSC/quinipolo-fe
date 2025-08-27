import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Alert, Card, Button } from "antd";
import { UserOutlined, IdcardOutlined, SmileOutlined } from "@ant-design/icons";
import { Typography } from "@mui/material";
import { supabase } from "../../lib/supabaseClient";
import { apiGet, apiPost } from "../../utils/apiUtils";
import { calculateAge } from "../../utils/calculateAge";
import { UserDataType, useUser } from "../../Context/UserContext/UserContext";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

type Props = { children: React.ReactNode };

const OAuthCallbackHandler = ({ children }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileForm] = Form.useForm();
  const { refreshUserData, updateUser } = useUser();

  useEffect(() => {
    const checkUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Ensure auth state is set so refreshUserData guard passes
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token ?? "";
          localStorage.setItem("userId", user.id ?? "");
          localStorage.setItem("isAuthenticated", "true");
          if (token) localStorage.setItem("token", token);
          updateUser({
            userId: user.id ?? "",
            isAuthenticated: true,
          });
        } catch (e) {
          console.error("Error setting auth state after OAuth callback:", e);
        }
        // check if the user has a profile via the BE
        try {
          const profile = await apiGet<UserDataType>("/api/users/me/profile");
        } catch (error: any) {
          // If the profile does not exist yet, BE returns 404
          if (
            error?.response?.status === 404 &&
            user.app_metadata?.provider === "google"
          ) {
            console.log("user profile not found (404), showing modal");
            setCurrentUser(user);
            setShowProfileModal(true);
          } else {
            console.error("Error checking user profile:", error);
          }
        }
      }
    };

    checkUserProfile();
  }, [updateUser]);

  const handleProfileSubmit = async (values: {
    username: string;
    birthday: string;
  }) => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const age = calculateAge(values.birthday);

      if (age < 18) {
        setError(t("mustBe18OrOlder"));
        setLoading(false);
        return;
      }

      await apiPost("/api/auth/google-signup", {
        userId: currentUser.id,
        email: currentUser.email,
        fullName:
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name,
        username: values.username,
        birthday: values.birthday,
        isUserOver18: age >= 18,
      });

      setShowProfileModal(false);
      setCurrentUser(null);

      await refreshUserData();
      navigate("/");
    } catch (error: any) {
      if (error?.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(error.message || "An error occurred during signup");
      }
    }

    setLoading(false);
  };

  return (
    <>
      {children}
      <Modal
        open={showProfileModal}
        onCancel={() => setShowProfileModal(false)}
        footer={null}
        closable={false}
        maskClosable={false}
        width={480}
        centered
        styles={{
          content: {
            borderRadius: 24,
            padding: 40,
            top: 20,
          },
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SmileOutlined
            style={{ fontSize: 36, color: "#1890ff", marginBottom: 24 }}
          />

          <Typography
            variant="h5"
            style={{ fontWeight: 700, marginTop: 8, marginBottom: 4 }}
          >
            {t("completeGoogleSignup") || "Complete Google Signup"}
          </Typography>
          <Typography
            variant="body2"
            style={{ color: "#666", fontSize: 14, marginBottom: 24 }}
          >
            {t("completeProfileMessage") ||
              "Please complete your profile to continue"}
          </Typography>
        </div>

        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileSubmit}
        >
          <Form.Item
            name="username"
            label={
              <span>
                {t("username")} <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[
              {
                required: true,
                message: t("username") + " " + t("isRequired"),
              },
              {
                min: 3,
                message: "Username must be at least 3 characters long",
              },
              { max: 15, message: "Username cannot exceed 15 characters" },
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
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="birthday"
            label={
              <span>
                {t("birthday") || "Birthday"}{" "}
                <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[
              {
                required: true,
                message: (t("birthday") || "Birthday") + " " + t("isRequired"),
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const age = calculateAge(value);
                  if (age >= 18) return Promise.resolve();
                  return Promise.reject(
                    new Error(
                      t("mustBe18OrOlder") ||
                        "You must be 18 or older to sign up"
                    )
                  );
                },
              },
            ]}
          >
            <Input
              type="date"
              prefix={<IdcardOutlined style={{ color: "#1890ff" }} />}
              placeholder={t("birthday") || "Birthday"}
              size="large"
              max={new Date().toISOString().split("T")[0]}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          {error && (
            <Alert
              message={error}
              type="error"
              style={{ marginBottom: 16, borderRadius: 8 }}
              showIcon
            />
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
            <Button
              onClick={() => setShowProfileModal(false)}
              size="large"
              style={{
                flex: 1,
                borderRadius: 8,
                fontWeight: 600,
                borderColor: "#d9d9d9",
                color: "#666",
              }}
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              type="primary"
              onClick={() => profileForm.submit()}
              loading={loading}
              size="large"
              style={{
                flex: 1,
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              {t("complete") || "Complete"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default OAuthCallbackHandler;
