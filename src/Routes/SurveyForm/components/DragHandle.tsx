import React from "react";
import { IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import styles from "./DragHandle.module.scss";

interface DragHandleProps {
  listeners?: any;
  attributes?: any;
  isDragging?: boolean;
  disabled?: boolean;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  listeners,
  attributes,
  isDragging,
  disabled,
}) => {
  return (
    <IconButton
      className={`${styles.dragHandle} ${isDragging ? styles.dragging : ""} ${
        disabled ? styles.disabled : ""
      }`}
      {...(disabled ? {} : listeners)}
      {...(disabled ? {} : attributes)}
      aria-label="Drag to reorder"
      size="small"
      disabled={disabled}
      sx={{
        cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <DragIndicatorIcon />
    </IconButton>
  );
};
