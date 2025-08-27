import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserProvider, useUser } from "./Context/UserContext/UserContext";
import { FeedbackProvider } from "./Context/FeedbackContext/FeedbackContext";
import { ThemeProvider } from "./Context/ThemeContext/ThemeContext";
import MenuBar from "./Components/MenuBar/MenuBar";
import {
  AnswersForm,
  CorrectionSuccess,
  CreateLeague,
  Dashboard,
  Landing,
  LeagueDashboard,
  Profile,
  LeagueList,
  LeagueSuccess,
  LoginForm,
  NewLeague,
  QuinipoloSuccess,
  ResetPassword,
  SignUpForm,
  EmailConfirmation,
  SurveyForm,
} from "./Routes";
import { supabase } from "./lib/supabaseClient";
import { Modal, Form, Input, Button, Alert } from "antd";
import { UserOutlined, IdcardOutlined } from "@ant-design/icons";
import { apiPost } from "./utils/apiUtils";

const OAuthCallbackHandler = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileForm] = Form.useForm();

  useEffect(() => {
    const checkUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Check if user has a profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile && user.app_metadata?.provider === "google") {
          // Google user without profile - show modal
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
      // Validate age
      const birthDate = new Date(values.birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        setError(t("mustBe18OrOlder"));
        setLoading(false);
        return;
      }

      // Create profile for Google user
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
      window.location.reload(); // Refresh to update user context
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

                  const birthDate = new Date(value);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                  ) {
                    age--;
                  }

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

function App() {
  const { userData } = useUser();
  const isAuthenticated = userData.isAuthenticated;
  console.log("isAuthenticated", isAuthenticated);
  return (
    <React.StrictMode>
      <BrowserRouter>
        <FeedbackProvider>
          <UserProvider>
            <ThemeProvider>
              <OAuthCallbackHandler>
                <Routes>
                  <Route path="/sign-in" element={<LoginForm />} />
                  <Route path="/signup" element={<SignUpForm />} />
                  <Route
                    path="/email-confirmation"
                    element={<EmailConfirmation />}
                  />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Auth callback route for magic link deep linking */}
                  {/* <Route path="auth/callback" element={<AuthCallback />} /> */}

                  <Route
                    path="/"
                    element={isAuthenticated ? <MenuBar /> : <Landing />}
                  >
                    <Route
                      path="/"
                      element={isAuthenticated ? <Dashboard /> : null}
                    />
                    <Route path="crear-quinipolo" element={<SurveyForm />} />
                    <Route
                      path="quinipolo-success"
                      element={<QuinipoloSuccess />}
                    />
                    <Route
                      path="correction-success"
                      element={<CorrectionSuccess />}
                    />

                    <Route path="quinipolo" element={<AnswersForm />}>
                      <Route path="correct" element={<AnswersForm />} />
                    </Route>

                    <Route path="dashboard" element={<Dashboard />} />
                    <Route
                      path="league-dashboard"
                      element={<LeagueDashboard />}
                    />
                    <Route path="profile" element={<Profile />} />
                    <Route path="join-league" element={<LeagueList />} />
                    <Route path="crear-liga" element={<NewLeague />} />
                    <Route path="create-league" element={<CreateLeague />} />
                    <Route path="league-success" element={<LeagueSuccess />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Route>

                  {/* <Route path="*" element={<NoMatch />} /> */}
                </Routes>
              </OAuthCallbackHandler>
            </ThemeProvider>
          </UserProvider>
        </FeedbackProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
