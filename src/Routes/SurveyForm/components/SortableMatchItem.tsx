import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import MatchForm from "../../../Components/MatchForm/MatchForm";
import { DragHandle } from "./DragHandle";
import { Match15LockToggle } from "./Match15LockToggle";
import { SurveyData, TeamOptionsBySport } from "../../../types/quinipolo";
import styles from "./SortableMatchItem.module.scss";

interface SortableMatchItemProps {
  id: string;
  index: number;
  quinipolo: SurveyData[];
  setQuinipolo: React.Dispatch<React.SetStateAction<SurveyData[]>>;
  teamOptions: TeamOptionsBySport;
  selectedTeams: string[];
  loading: boolean;
  allowRepeatedTeams: boolean;
  onValidationChange: (matchIndex: number, error: string | null) => void;
  matchErrors: Record<number, string | null>;
  isMatch15Locked: boolean;
  setIsMatch15Locked: React.Dispatch<React.SetStateAction<boolean>>;
  isReorderingEnabled: boolean;
}

export const SortableMatchItem: React.FC<SortableMatchItemProps> = ({
  id,
  index,
  quinipolo,
  setQuinipolo,
  teamOptions,
  selectedTeams,
  loading,
  allowRepeatedTeams,
  onValidationChange,
  matchErrors,
  isMatch15Locked,
  setIsMatch15Locked,
  isReorderingEnabled,
}) => {
  const isLastMatch = index === 14;
  const isLocked = isLastMatch && isMatch15Locked;
  const isDragDisabled = !isReorderingEnabled || isLocked;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sortableItem} ${isDragging ? styles.dragging : ""}`}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 2,
          position: "relative",
        }}
      >
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center" }}>
          {isReorderingEnabled && (
            <>
              <DragHandle
                listeners={listeners}
                attributes={attributes}
                isDragging={isDragging}
                disabled={isDragDisabled}
              />
              {isLastMatch && (
                <Match15LockToggle
                  isLocked={isMatch15Locked}
                  onToggle={() => setIsMatch15Locked(!isMatch15Locked)}
                />
              )}
            </>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <MatchForm
            key={index}
            teamOptions={teamOptions}
            selectedTeams={selectedTeams}
            index={index}
            setQuinipolo={setQuinipolo}
            loading={loading}
            allowRepeatedTeams={allowRepeatedTeams}
            onValidationChange={onValidationChange}
            value={quinipolo[index]}
          />
        </Box>
      </Box>
    </div>
  );
};
