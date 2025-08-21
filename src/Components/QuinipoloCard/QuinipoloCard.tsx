import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Countdown from "react-countdown";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import styles from "./QuinipoloCard.module.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { apiPatch } from "../../utils/apiUtils";
import { useTheme } from "../../Context/ThemeContext/ThemeContext";
import { useTranslation } from "react-i18next";
import { QuinipoloCardProps } from "../../types/quinipolo";
import { isUserModerator } from "../../utils/moderatorUtils";
import { red } from "@mui/material/colors";

dayjs.extend(utc);
dayjs.extend(timezone);

const QuinipoloCard = ({
  quinipolo,
  deadlineIsInPast,
  username,
  userLeagues,
}: QuinipoloCardProps) => {
  console.log("QuinipoloCard - moderator check:", {
    quinipoloId: quinipolo.id,
    leagueId: quinipolo.league_id,
    leagueName: quinipolo.league_name,
    userLeagues,
    isModerated: isUserModerator(userLeagues, quinipolo.league_id),
    hasBeenCorrected: quinipolo.has_been_corrected,
    deadlineIsInPast,
    isDeleted: quinipolo.is_deleted,
  });
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [countdown, setCountdown] = React.useState(5);
  const [canConfirm, setCanConfirm] = React.useState(false);
  const [currentDeadlineIsInPast, setCurrentDeadlineIsInPast] =
    React.useState(deadlineIsInPast);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();

  // Simple timer completion handler
  const handleTimerComplete = () => {
    if (!currentDeadlineIsInPast) {
      console.log(`Quinipolo ${quinipolo.id} timer expired`);
      setCurrentDeadlineIsInPast(true);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
    setCountdown(5);
    setCanConfirm(false);
    handleMenuClose();

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer when modal is closed
    return () => clearInterval(timer);
  };

  const handleDeleteQuinipolo = async () => {
    const response = await apiPatch(
      `/api/quinipolos/quinipolo/${quinipolo.id}/delete`,
      null
    );
    console.log("Quinipolo marked as deleted:", response);
    setDeleteModalOpen(false);
  };

  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setCanConfirm(false);
  };

  return (
    <div
      className={`${styles.quinipoloContainer} ${
        quinipolo.is_deleted ? styles.deleted : ""
      } ${theme === "dark" ? styles.dark : ""}`}
      key={`${quinipolo.league_name}-${quinipolo.end_date}`}
    >
      <div className={styles.quinipoloInfo}>
        <div className={styles.quinipoloInfoHeader}>
          <div className={styles.quinipoloInfoLeft}>
            <h2>{`${quinipolo.league_name}`}</h2>
            <h3
              className={`${styles.endDate} ${
                theme === "dark" ? styles.endDateDark : ""
              }`}
            >
              {dayjs(quinipolo.end_date).utc().format("DD/MM/YY HH:mm")}
            </h3>
          </div>
          <div className={styles.quinipoloInfoRight}>
            {quinipolo.is_deleted ? (
              <p>{t("deleted")}</p>
            ) : (
              <>
                {!quinipolo.participants_who_answered?.includes(username) ? (
                  <p>{t("notAnswered")}</p>
                ) : null}
                {!currentDeadlineIsInPast ? (
                  <p
                    className={`${styles.countdown} ${
                      theme !== "light" && styles.countdownDark
                    }`}
                  >
                    {new Date(quinipolo.end_date) > new Date() && (
                      <Countdown
                        date={quinipolo.end_date}
                        onComplete={handleTimerComplete}
                      />
                    )}
                  </p>
                ) : null}
              </>
            )}
          </div>
          {isUserModerator(userLeagues, quinipolo.league_id) &&
          !quinipolo.has_been_corrected &&
          !quinipolo.is_deleted ? (
            <>
              <IconButton
                sx={{ padding: 0, ml: 1 }}
                aria-label="more"
                id="long-button"
                size="small"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleMenuClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem
                  sx={{
                    fontSize: "12px",
                    padding: "2px 8px",
                  }}
                  onClick={handleDeleteClick}
                >
                  {t("deleteBtn")}
                </MenuItem>
              </Menu>
            </>
          ) : null}
        </div>

        <div className={styles.quinipoloActions}>
          {!quinipolo.participants_who_answered?.includes(username) && (
            <Button
              className={`${styles.actionButton} ${
                currentDeadlineIsInPast || quinipolo.is_deleted
                  ? ""
                  : "gradient-primary"
              }`}
              disabled={currentDeadlineIsInPast || quinipolo.is_deleted}
              onClick={() => navigate(`/quinipolo?id=${quinipolo.id}`)}
              variant={"contained"}
            >
              <span>{t("answer")}</span>
              <PlayCircleFilledIcon />
            </Button>
          )}
          {isUserModerator(userLeagues, quinipolo.league_id) &&
            !quinipolo.has_been_corrected &&
            currentDeadlineIsInPast && (
              <Tooltip arrow title={!currentDeadlineIsInPast && t("edit")}>
                <Button
                  className={`${styles.actionButton} ${
                    styles.actionButtonCorrect
                  } ${quinipolo.is_deleted ? "" : "gradient-mint"} ${
                    theme === "dark" ? styles.dark : ""
                  }`}
                  onClick={() => {
                    navigate(
                      `/quinipolo/correct?id=${quinipolo.id}&correct=true`
                    );
                  }}
                  variant={"contained"}
                  disabled={quinipolo.is_deleted}
                >
                  <span>{t("correct")}</span>
                  <EditIcon />
                </Button>
              </Tooltip>
            )}
          {quinipolo.has_been_corrected &&
            isUserModerator(userLeagues, quinipolo.league_id) && (
              <Button
                className={`${styles.actionButton} ${
                  styles.actionButtonCorrect
                } ${quinipolo.is_deleted ? "" : "gradient-mint"}`}
                onClick={() =>
                  navigate(`/quinipolo?id=${quinipolo.id}&correctionEdit=true`)
                }
                disabled={quinipolo.is_deleted}
                variant={"contained"}
              >
                <span>{t("edit")}</span>
                <EditIcon />
              </Button>
            )}
          {quinipolo.has_been_corrected ||
          quinipolo.participants_who_answered?.includes(username) ? (
            <Button
              className={`${styles.actionButton} ${
                quinipolo.is_deleted ? "" : "gradient-primary"
              }`}
              onClick={() => {
                navigate(`/quinipolo?id=${quinipolo.id}&see=true`);
              }}
              disabled={quinipolo.is_deleted}
              variant={"contained"}
            >
              <span>{t("answers")}</span>
              <VisibilityIcon />
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog
        open={deleteModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "error.main", fontWeight: "bold" }}>
          {t("deleteConfirmTitle")}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 2,
              py: 2,
            }}
          >
            {countdown > 0 ? (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  {countdown}
                </span>{" "}
                {t("deleteConfirmMessage")}
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                {t("readyToDelete")}
              </Typography>
            )}
            {!canConfirm && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 1, textAlign: "center" }}
              >
                {t("pleaseWaitBeforeConfirming")}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            justifyContent: "center",
            flexDirection: "column-reverse",
            gap: 2,
          }}
        >
          <Button
            onClick={handleCloseModal}
            color="primary"
            variant="outlined"
            fullWidth
          >
            {t("cancel")}
          </Button>
          {canConfirm && (
            <Button
              onClick={handleDeleteQuinipolo}
              color="error"
              variant="contained"
              fullWidth
              sx={{ fontWeight: "bold" }}
            >
              {t("confirmDelete")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuinipoloCard;
