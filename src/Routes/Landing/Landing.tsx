import { Button, Flex, Typography } from "antd";
import { Footer } from "antd/es/layout/layout";
import React from "react";
import MenuBar from "../../Components/MenuBar/MenuBar";
import styles from "./Landing.module.scss";
import { useNavigate } from "react-router-dom";
import { Paper } from "@mui/material";
import mockupPNG from "../../assets/mockup.png";
import mockupPNG2 from "../../assets/mockup2.png";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const items = [
  {
    key: String(1),
    label: `nav ${1}`,
  },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <MenuBar />
      <div className={styles.container}>
        <div className={styles.firstSection}>
          <div className={styles.firstSectionContent}>
            <Title style={{ color: "white" }}>{t("landingTitle")}</Title>
            <p>{t("landingSubtitle")}</p>
            <Button
              style={{ width: "140px" }}
              onClick={() => navigate("/sign-in")}
            >
              {t("landingCta")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                width="1em"
                height="1em"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  d="M26 28H6a2.003 2.003 0 0 1-2-2V6a2.003 2.003 0 0 1 2-2h10v2H6v20h20V16h2v10a2.003 2.003 0 0 1-2 2"
                ></path>
                <path
                  fill="currentColor"
                  d="M20 2v2h6.586L18 12.586L19.414 14L28 5.414V12h2V2z"
                ></path>
              </svg>
            </Button>
          </div>
          <img src={mockupPNG} alt={t("mockupAlt")} />
        </div>
        <Paper className={styles.secondSection}>
          <Flex align="center" vertical justify="center">
            <Title>{t("landingSecondTitle")}</Title>
            <Typography style={{ marginTop: 10 }}>
              {t("landingSecondSubtitle")}
            </Typography>
            <Button
              style={{ width: "140px", marginTop: 10 }}
              onClick={() => navigate("/sign-in")}
            >
              {t("landingSecondCta")}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                width="1em"
                height="1em"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  d="M26 28H6a2.003 2.003 0 0 1-2-2V6a2.003 2.003 0 0 1 2-2h10v2H6v20h20V16h2v10a2.003 2.003 0 0 1-2 2"
                ></path>
                <path
                  fill="currentColor"
                  d="M20 2v2h6.586L18 12.586L19.414 14L28 5.414V12h2V2z"
                ></path>
              </svg>
            </Button>
          </Flex>
          <img src={mockupPNG2} alt={t("mockup2Alt")} />
        </Paper>
        <Footer className={styles.footer}>
          {t("footerText", {
            year: new Date().getFullYear(),
            author: "Salvador Sánchez",
          })}
        </Footer>
      </div>
    </>
  );
};

export default Landing;
