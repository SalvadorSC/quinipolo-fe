import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Tooltip,
  Box,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Person,
  Group,
  CalendarToday,
  Description,
  Archive,
  PersonRemove,
  Edit,
  ManageAccounts,
  Share,
  Close,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import styles from "./LeagueInfo.module.scss";

interface LeagueInfoProps {
  leagueData: {
    league_name: string;
    creator?: {
      username: string;
      full_name?: string;
    };
    participants: {
      user_id: string;
      username: string;
      role: string;
    }[];
    created_at?: string;
    description?: string;
    created_by?: string;
  };
  isUserModerator: boolean;
  isUserCreator: boolean;
  isSystemModerator: boolean;
  onEditLeague?: () => void;
  onManageModerators?: () => void;
  onShareLeague?: () => void;
  onEditIcon?: () => void;
  setShowLeagueInfo?: () => void;
}

const LeagueInfo: React.FC<LeagueInfoProps> = ({
  leagueData,
  isUserModerator,
  isUserCreator,
  isSystemModerator,
  onEditLeague,
  onManageModerators,
  onShareLeague,
  onEditIcon,
  setShowLeagueInfo,
}) => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("unknown");
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const moderators = leagueData.participants.filter(
    (p) => p.role === "moderator"
  );

  const creatorUsername =
    leagueData.creator?.username ||
    leagueData.participants.find((p) => p.user_id === leagueData.created_by)
      ?.username
      ? `@${
          leagueData.creator?.username ||
          leagueData.participants.find(
            (p) => p.user_id === leagueData.created_by
          )?.username
        }`
      : t("unknown");

  return (
    <Card className={styles.leagueInfoCard}>
      <div className={styles.leagueInfoTitle}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {t("leagueInformation")}
        </Typography>
        <IconButton onClick={setShowLeagueInfo} aria-label={t("close")}>
          <Close />
        </IconButton>
      </div>
      <CardContent className={styles.cardContent}>
        <Stack spacing={3}>
          {/* League Creator */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Person color="primary" />
              <Typography variant="h6" component="h3">
                {t("leagueCreator")}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {creatorUsername}
            </Typography>
          </Box>

          <Divider />

          {/* Current Moderators */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Group color="primary" />
              <Typography variant="h6" component="h3">
                {t("currentModerators")}
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {moderators.length > 0 ? (
                moderators.map((moderator) => (
                  <Chip
                    key={moderator.user_id}
                    label={`@${moderator.username}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("noModerators")}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Creation Date */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <CalendarToday color="primary" />
              <Typography variant="h6" component="h3">
                {t("createdOn")}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {formatDate(leagueData.created_at)}
            </Typography>
          </Box>

          <Divider />

          {/* League Description */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Description color="primary" />
              <Typography variant="h6" component="h3">
                {t("description")}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              {leagueData.description || t("noDescription")}
            </Typography>
          </Box>

          {/* Moderator Actions */}
          {(isUserModerator || isUserCreator) && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {t("moderatorActions")}
                </Typography>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  flexWrap="wrap"
                  gap={1}
                  justifyContent="center"
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={onEditLeague}
                    sx={{
                      width: { xs: "100%", md: "auto" },
                      borderRadius: "20px",
                      marginTop: 0,
                    }}
                  >
                    {t("editLeague")}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={onEditIcon}
                    sx={{
                      width: { xs: "100%", md: "auto" },
                      borderRadius: "20px",
                      marginTop: 0,
                    }}
                  >
                    {t("editIcon")}
                  </Button>
                  {isSystemModerator && (
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<Share />}
                      onClick={onShareLeague}
                      sx={{
                        width: { xs: "100%", md: "auto" },
                        borderRadius: "20px",
                        marginTop: 0,
                      }}
                    >
                      {t("shareLeague")}
                    </Button>
                  )}
                  {isUserCreator && (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<ManageAccounts />}
                      onClick={onManageModerators}
                      sx={{
                        width: { xs: "100%", md: "auto" },
                        borderRadius: "20px",
                        marginTop: 0,
                      }}
                    >
                      {t("manageModerators")}
                    </Button>
                  )}
                  <Tooltip title={t("currentlyInDevelopment")}>
                    <span>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Archive />}
                        disabled
                        sx={{
                          width: { xs: "100%", md: "auto" },
                          borderRadius: "20px",
                          marginTop: 0,
                        }}
                      >
                        {t("archiveLeague")}
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title={t("currentlyInDevelopment")}>
                    <span>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<PersonRemove />}
                        disabled
                        sx={{
                          width: { xs: "100%", md: "auto" },
                          borderRadius: "20px",
                          marginTop: 0,
                        }}
                      >
                        {t("kickParticipant")}
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LeagueInfo;
