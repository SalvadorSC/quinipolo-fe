import React from "react";
import MenuBar from "../../Components/MenuBar/MenuBar";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Form, Input, Button, Alert, Card } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  IdcardOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import stylesSignUpForm from "./SignUpForm.module.scss";
import { calculateAge } from "../../utils/calculateAge";
import { useSignup } from "../../hooks/auth";

const SignUpForm = () => {
  const { t } = useTranslation();
  const { signup, loading, error } = useSignup();

  const onFinish = async (values: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    confirmPassword: string;
    birthday: string;
  }) => {
    // Password confirmation is already validated by the form
    // Just extract the fields we need
    const { email, password, username, fullName, birthday } = values;

    await signup({
      email,
      password,
      username,
      fullName,
      birthday,
    });
  };

  return (
    <div className={stylesSignUpForm.pageContainer}>
      <MenuBar />
      <Card className={stylesSignUpForm.card}>
        <div className={stylesSignUpForm.header}>
          <SmileOutlined className={stylesSignUpForm.headerIcon} />
          <Typography variant="h5" className={stylesSignUpForm.title}>
            {t("signUp")} 🎉
          </Typography>
        </div>
        <Form name="signup" onFinish={onFinish} layout="vertical">
          <div className={stylesSignUpForm.signupFormContainer}>
            <div className={stylesSignUpForm.signupForm}>
              <Form.Item
                className={stylesSignUpForm.formItem}
                name="email"
                label={t("email")}
                rules={[
                  {
                    required: true,
                    message: t("email") + " " + t("isRequired"),
                  },
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
                className={stylesSignUpForm.formItem}
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
                className={stylesSignUpForm.formItem}
                name="confirmPassword"
                label={t("confirmPassword") || "Confirm password"}
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message:
                      (t("confirmPassword") || "Confirm password") +
                      " " +
                      t("isRequired"),
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
                  placeholder={t("confirmPassword") || "Confirm password"}
                  size="large"
                  autoComplete="new-password"
                />
              </Form.Item>
            </div>
            <div className={stylesSignUpForm.signupForm}>
              <Form.Item
                className={stylesSignUpForm.formItem}
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
                className={stylesSignUpForm.formItem}
                name="birthday"
                label={t("birthday") || "Birthday"}
                rules={[
                  {
                    required: true,
                    message:
                      (t("birthday") || "Birthday") + " " + t("isRequired"),
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
              <Form.Item
                className={stylesSignUpForm.formItem}
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
            </div>
          </div>
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
        <div className={stylesSignUpForm.signinLink}>
          <a href="/sign-in" className={stylesSignUpForm.signinAnchor}>
            {t("alreadyHaveAccountLogin") ||
              "Already have an account? Log in here."}
          </a>
        </div>
      </Card>
    </div>
  );
};

export default SignUpForm;
