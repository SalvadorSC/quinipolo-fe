import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Alert } from "antd";
import { UserOutlined, IdcardOutlined } from "@ant-design/icons";
import { supabase } from "../../lib/supabaseClient";
import { apiPost } from "../../utils/apiUtils";
import { calculateAge } from "../../utils/calculateAge";
import { useUser } from "../../Context/UserContext/UserContext";
import { User } from "@supabase/supabase-js";

type Props = { children: React.ReactNode };

const OAuthCallbackHandler = ({ children }: Props) => {
  const { t } = useTranslation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileForm] = Form.useForm();
  const { refreshUserData } = useUser();

  useEffect(() => {
    const checkUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile && user.app_metadata?.provider === "google") {
          setCurrentUser(user);
          setShowProfileModal(true);
        }
      }
    };

    checkUserProfile();
  }, []);

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
        title={t("completeGoogleSignup") || "Complete Google Signup"}
        open={showProfileModal}
        onCancel={() => setShowProfileModal(false)}
        onOk={() => profileForm.submit()}
        confirmLoading={loading}
        okText={t("complete") || "Complete"}
        cancelText={t("cancel") || "Cancel"}
        closable={false}
        maskClosable={false}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileSubmit}
        >
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
            />
          </Form.Item>
          <Form.Item
            name="birthday"
            label={t("birthday") || "Birthday"}
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
        </Form>
      </Modal>
    </>
  );
};

export default OAuthCallbackHandler;
