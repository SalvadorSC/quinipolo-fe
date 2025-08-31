import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { apiPatch } from "../../utils/apiUtils";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (username: string, email: string) => void;
  currentUsername: string;
  currentEmail: string;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onClose,
  onSave,
  currentUsername,
  currentEmail,
}) => {
  const { t } = useTranslation();
  const [formUsername, setFormUsername] = useState(currentUsername);
  const [formEmail, setFormEmail] = useState(currentEmail);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setUsernameError("");

      // Client-side validation
      if (formUsername.length < 3) {
        setUsernameError(t("usernameMinLength"));
        return;
      }

      if (formUsername.length > 15) {
        setUsernameError(t("usernameMaxLength"));
        return;
      }

      if (formUsername.toLowerCase().includes("quinipolo")) {
        setUsernameError(t("usernameSecurityError"));
        return;
      }

      const body: any = { username: formUsername, email: formEmail };
      const updated = await apiPatch<{
        id: string;
        username: string;
        email: string;
      }>(`/api/users/me/profile`, body);

      onSave(updated.username, updated.email);
      onClose();
    } catch (e: any) {
      // Handle server-side validation errors
      if (e?.response?.data?.error) {
        const errorMessage = e.response.data.error;
        if (errorMessage.includes("quinipolo")) {
          setUsernameError(t("usernameSecurityError"));
        } else if (errorMessage.includes("already exists")) {
          setUsernameError(t("usernameAlreadyExists"));
        } else if (errorMessage.includes("restricted words")) {
          setUsernameError(t("usernameRestrictedWordsError"));
        } else {
          setUsernameError(errorMessage);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormUsername(currentUsername);
    setFormEmail(currentEmail);
    setUsernameError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{t("editProfile")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label={t("username")}
            value={formUsername}
            onChange={(e) => {
              setFormUsername(e.target.value);
              setUsernameError("");
            }}
            error={!!usernameError}
            helperText={usernameError}
            fullWidth
          />
          <TextField
            label={t("email")}
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            type="email"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("cancel")}</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;
