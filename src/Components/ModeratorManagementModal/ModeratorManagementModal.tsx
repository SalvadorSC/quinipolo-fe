import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Button,
  Stack,
  Typography,
  Tooltip,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useTranslation } from "react-i18next";
import {
  ArrowForward,
  ArrowBack,
  Person,
  AdminPanelSettings,
} from "@mui/icons-material";

interface Participant {
  user_id: string;
  username: string;
  role: string;
}

interface ModeratorManagementModalProps {
  open: boolean;
  participants: Participant[];
  creatorId?: string;
  onClose: () => void;
  onSave: (moderatorIds: string[]) => Promise<void>;
}

const ModeratorManagementModal: React.FC<ModeratorManagementModalProps> = ({
  open,
  participants,
  creatorId,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null
  );
  const [selectedModerator, setSelectedModerator] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [currentModerators, setCurrentModerators] = useState<Participant[]>([]);

  useEffect(() => {
    if (open) {
      const moderators = participants.filter((p) => p.role === "moderator");
      setCurrentModerators(moderators);
      setSelectedParticipant(null);
      setSelectedModerator(null);
    }
  }, [open, participants]);

  const regularParticipants = participants.filter(
    (p) =>
      p.user_id !== creatorId &&
      !currentModerators.some((m) => m.user_id === p.user_id)
  );
  const moderators = currentModerators;

  const handleMoveToModerators = () => {
    if (selectedParticipant) {
      const participantToAdd = participants.find(
        (p) => p.user_id === selectedParticipant
      );
      if (participantToAdd) {
        setCurrentModerators((prev) => [...prev, participantToAdd]);
        setSelectedParticipant(null);
      }
    }
  };

  const handleRemoveFromModerators = () => {
    if (selectedModerator && selectedModerator !== creatorId) {
      setCurrentModerators((prev) =>
        prev.filter((moderator) => moderator.user_id !== selectedModerator)
      );
      setSelectedModerator(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const moderatorIds = currentModerators.map((m) => m.user_id);
      await onSave(moderatorIds);
      onClose();
    } catch (error) {
      console.error("Error saving moderators:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isCreator = (userId: string) => userId === creatorId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("manageModerators")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2" color="text.secondary">
            {t("manageModeratorsDescription")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Regular Participants */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {t("participants")} ({regularParticipants.length})
              </Typography>
              <List
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {regularParticipants.map((participant) => (
                  <ListItem
                    key={participant.user_id}
                    disablePadding
                    selected={selectedParticipant === participant.user_id}
                  >
                    <ListItemButton
                      onClick={() =>
                        setSelectedParticipant(participant.user_id)
                      }
                    >
                      <Person sx={{ mr: 1 }} />
                      <ListItemText primary={participant.username} />
                    </ListItemButton>
                  </ListItem>
                ))}
                {regularParticipants.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={t("noParticipants")}
                      sx={{ textAlign: "center", color: "text.secondary" }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleMoveToModerators}
                disabled={!selectedParticipant}
                startIcon={
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <ArrowForward />
                  </Box>
                }
                endIcon={
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    <ArrowForward sx={{ transform: "rotate(90deg)" }} />
                  </Box>
                }
                sx={{ minWidth: "auto" }}
              >
                {t("makeModerator")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleRemoveFromModerators}
                disabled={!selectedModerator || isCreator(selectedModerator)}
                startIcon={
                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <ArrowBack />
                  </Box>
                }
                endIcon={
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    <ArrowBack sx={{ transform: "rotate(90deg)" }} />
                  </Box>
                }
                sx={{ minWidth: "auto" }}
              >
                {t("removeModerator")}
              </Button>
            </Box>

            {/* Moderators */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {t("moderators")} ({moderators.length})
              </Typography>
              <List
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {moderators.map((moderator) => (
                  <ListItem
                    key={moderator.user_id}
                    disablePadding
                    selected={selectedModerator === moderator.user_id}
                  >
                    <Tooltip
                      title={
                        isCreator(moderator.user_id)
                          ? t("creatorCannotBeRemoved")
                          : ""
                      }
                      disableHoverListener={!isCreator(moderator.user_id)}
                    >
                      <ListItemButton
                        onClick={() =>
                          !isCreator(moderator.user_id) &&
                          setSelectedModerator(moderator.user_id)
                        }
                        disabled={isCreator(moderator.user_id)}
                        sx={{
                          opacity: isCreator(moderator.user_id) ? 0.6 : 1,
                        }}
                      >
                        <AdminPanelSettings sx={{ mr: 1 }} />
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              @{moderator.username}
                              {isCreator(moderator.user_id) && (
                                <Chip
                                  label={t("creator")}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                ))}
                {moderators.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary={t("noModerators")}
                      sx={{ textAlign: "center", color: "text.secondary" }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <LoadingButton
          onClick={handleSave}
          variant="contained"
          loading={isSaving}
        >
          {t("saveChanges")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ModeratorManagementModal;
