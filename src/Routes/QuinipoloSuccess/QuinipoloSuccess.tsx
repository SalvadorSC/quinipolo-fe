import React from "react";
import { Button, Paper } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import HomeIcon from "@mui/icons-material/Home";
import style from "./QuinipoloSuccess.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import dayjs from "dayjs";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { useTranslation } from "react-i18next";

const QuinipoloSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();
  const deepLink = `https://quinipolo.com/quinipolo?${location.state.quinipolo.id}`;
  // Function to construct the deep link

  const messageToShare = `${t("inviteToQuinipolo")} ${deepLink}`;

  const copyMessageToClipboard = () => {
    navigator.clipboard
      .writeText(messageToShare)
      .then(() => {
        setFeedback({
          message: t("messageCopied"),
          severity: "success",
          open: true,
        });
      })
      .catch((err) => {
        setFeedback({
          message: t("errorCopyingMessage"),
          severity: "error",
          open: true,
        });
      });
  };

  return (
    <div className={style.quinipoloSuccessContainer}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: 4,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "space-evenly",
          borderRadius: 4,
        }}
      >
        <h2>{t("quinipoloCreatedSuccess")}</h2>
        <p>{t("deadlineToAnswer")}</p>
        <p>
          {dayjs(location.state.quinipolo.end_date).format("DD-MM-YYYY HH:mm")}h
        </p>
        <br />
        <p>{t("shareQuinipoloWithFriends")}</p>
        {/* Mensaje de compartir */}
        <QRCode className={style.qrCode} value={deepLink} />
        <Button
          variant="contained"
          onClick={copyMessageToClipboard}
          className="gradient-primary"
          fullWidth
          startIcon={<ContentCopyIcon />}
        >
          {t("copyMessage")}
        </Button>
        <Button
          variant="contained"
          onClick={copyMessageToClipboard}
          style={{ marginTop: 16 }}
          className="gradient-success"
          fullWidth
          startIcon={<WhatsAppIcon />}
        >
          <a
            href={`https://wa.me/?text=${encodeURIComponent(messageToShare)}`}
            target="_blank"
            style={{ color: "white", textDecoration: "none" }}
            rel="noopener noreferrer"
          >
            {t("shareOnWhatsApp")}
          </a>
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            navigate("/dashboard");
          }}
          className={`${style.returnButton} gradient-secondary`}
          style={{ marginTop: 16 }}
          fullWidth
          startIcon={<HomeIcon />}
        >
          {t("returnToMainMenu")}
        </Button>
      </Paper>
    </div>
  );
};

export default QuinipoloSuccess;
