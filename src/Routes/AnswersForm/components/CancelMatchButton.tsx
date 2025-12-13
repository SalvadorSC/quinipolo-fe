import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MoreVert, Cancel, CheckCircle } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface CancelMatchButtonProps {
  matchIndex: number;
  isCancelled: boolean;
  onCancel: (matchIndex: number) => void;
  disabled?: boolean;
}

export const CancelMatchButton: React.FC<CancelMatchButtonProps> = ({
  matchIndex,
  isCancelled,
  onCancel,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCancelClick = () => {
    onCancel(matchIndex);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t("matchOptions") || "Match options"} arrow>
        <IconButton
          size="small"
          onClick={handleClick}
          disabled={disabled}
          sx={{
            padding: "4px",
            color: isCancelled ? "success.main" : "text.secondary",
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleCancelClick}>
          <ListItemIcon>
            {isCancelled ? (
              <CheckCircle fontSize="small" color="success" />
            ) : (
              <Cancel fontSize="small" color="warning" />
            )}
          </ListItemIcon>
          <ListItemText>
            {isCancelled
              ? t("uncancelMatch") || "Uncancel match"
              : t("cancelMatch") || "Cancel match"}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
