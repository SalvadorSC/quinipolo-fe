import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Container, Stack, Typography, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InstagramIcon from "@mui/icons-material/Instagram";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import styles from "./Footer.module.scss";

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("info@quinipolo.com");
      // optional: show a toast; for now, simple alert-less UX
    } catch (e) {
      // ignore
    }
  };

  return (
    <footer role="contentinfo">
      <Container maxWidth="lg" className={styles.container}>
        <Box className={`${styles.footerBox} gradient-primary`} sx={{}}>
          <Stack spacing={1}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              className={styles.title}
            >
              {t("appName")}
            </Typography>
            <nav aria-label="Footer">
              <ul className={styles.links}>
                <li>
                  <Link to="/terms" className={styles.link}>
                    {t("footer.terms")}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className={styles.link}>
                    {t("footer.privacy")}
                  </Link>
                </li>
                {/* <li>
                  <a
                    href="#contact"
                    onClick={handleOpenContact}
                    className={styles.link}
                  >
                    {t("footer.contact")}
                  </a>
                </li> */}
                <li>
                  <Link to="/about" className={styles.link}>
                    {t("footer.about")}
                  </Link>
                </li>
                <li>
                  <IconButton
                    component="a"
                    href="https://instagram.com/quinipolo"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    color="inherit"
                    size="large"
                  >
                    <InstagramIcon />
                  </IconButton>
                </li>
                <li>
                  <IconButton
                    aria-label={t("contact.copyEmail")}
                    onClick={handleCopyEmail}
                    color="inherit"
                    size="large"
                  >
                    <AlternateEmailIcon />
                  </IconButton>
                </li>
              </ul>
            </nav>
            <Typography variant="caption" className={styles.copyright}>
              {t("footer.copyright", { year: currentYear })}
            </Typography>
          </Stack>
        </Box>
      </Container>
    </footer>
  );
}

export default Footer;
