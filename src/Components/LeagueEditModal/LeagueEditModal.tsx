import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tooltip,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useTranslation } from "react-i18next";
import {
  ICON_OPTIONS,
  LeagueIconKey,
  getLeagueIcon,
} from "../../utils/leagueIcons";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface LeagueEditModalProps {
  open: boolean;
  initialName: string;
  initialDescription?: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (data: { leagueName: string; description?: string }) => void;
}

const LeagueEditModal: React.FC<LeagueEditModalProps> = ({
  open,
  initialName,
  initialDescription,

  isSaving = false,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [leagueName, setLeagueName] = useState("");
  const [description, setDescription] = useState<string | undefined>("");

  useEffect(() => {
    if (open) {
      setLeagueName(initialName || "");
      setDescription(initialDescription || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialName, initialDescription]);

  const handleSubmit = () => {
    if (!leagueName.trim()) return;
    onSave({
      leagueName: leagueName.trim(),
      description: description?.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      style={{ borderRadius: 8 }}
    >
      <DialogTitle sx={{ textAlign: "left", fontWeight: 600 }}>
        {t("editLeague")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("leagueName")}
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label={t("description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          {/* <Tooltip title={t("currentlyInDevelopment") as string}>
            <span>
              <Button variant="outlined" disabled>
                {t("uploadImage")}
              </Button>
            </span>
          </Tooltip> */}
          {/* Icon and color editing moved to LeagueIconEditModal */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <LoadingButton
          onClick={handleSubmit}
          variant="contained"
          loading={isSaving}
          disabled={!leagueName.trim()}
        >
          {t("saveChanges")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default LeagueEditModal;
