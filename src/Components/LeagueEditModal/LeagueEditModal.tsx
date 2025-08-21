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
  }, [open, initialName, initialDescription]);

  const handleSubmit = () => {
    if (!leagueName.trim()) return;
    onSave({
      leagueName: leagueName.trim(),
      description: description?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("editLeague")}</DialogTitle>
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
          <Tooltip title={t("currentlyInDevelopment") as string}>
            <span>
              <Button variant="outlined" disabled>
                {t("uploadImage")}
              </Button>
            </span>
          </Tooltip>
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
