import React from "react";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import style from "../AnswersForm.module.scss";

interface SubmitButtonProps {
  onClick: () => void;
  loading: boolean;
  editCorrectionModeOn: boolean;
  isModerator: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  loading,
  editCorrectionModeOn,
  isModerator,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="contained"
      onClick={onClick}
      className={style.submitButton}
      type="submit"
      disabled={loading}
      startIcon={loading ? <div className={style.spinner} /> : undefined}
    >
      {editCorrectionModeOn && isModerator ? t("edit") : t("submit")}
    </Button>
  );
};
