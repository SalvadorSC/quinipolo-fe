import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableMatchItem } from "./SortableMatchItem";
import { ReorderingTooltip } from "./ReorderingTooltip";
import { SurveyData, TeamOptionsBySport } from "../../../types/quinipolo";
import { useFeedback } from "../../../Context/FeedbackContext/FeedbackContext";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import styles from "./ReorderableMatchList.module.scss";

interface ReorderableMatchListProps {
  quinipolo: SurveyData[];
  setQuinipolo: React.Dispatch<React.SetStateAction<SurveyData[]>>;
  teamOptions: TeamOptionsBySport;
  selectedTeams: string[];
  loading: boolean;
  allowRepeatedTeams: boolean;
  isMatch15Locked: boolean;
  setIsMatch15Locked: React.Dispatch<React.SetStateAction<boolean>>;
  onValidationChange: (matchIndex: number, error: string | null) => void;
  matchErrors: Record<number, string | null>;
}

export const ReorderableMatchList: React.FC<ReorderableMatchListProps> = ({
  quinipolo,
  setQuinipolo,
  teamOptions,
  selectedTeams,
  loading,
  allowRepeatedTeams,
  isMatch15Locked,
  setIsMatch15Locked,
  onValidationChange,
  matchErrors,
}) => {
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for mouse, touch, and keyboard
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate IDs for each match based on their index
  const items = quinipolo.map((_, index) => `match-${index}`);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = parseInt((active.id as string).split("-")[1]);
    const newIndex = parseInt((over.id as string).split("-")[1]);

    // If Match 15 is locked and the drag involves index 14
    if (isMatch15Locked && (oldIndex === 14 || newIndex === 14)) {
      setFeedback({
        message:
          t("match15.lockedWarning") ||
          "Match 15 is locked. Unlock it to reorder.",
        severity: "warning",
        open: true,
      });
      return;
    }

    setQuinipolo((items) => {
      const reordered = arrayMove(items, oldIndex, newIndex);

      // Update isGame15 flag based on final position
      return reordered.map((match, idx) => ({
        ...match,
        isGame15: idx === 14,
      }));
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <ReorderingTooltip />
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <Box className={styles.matchList}>
          {quinipolo.map((_, index) => (
            <SortableMatchItem
              key={`match-${index}`}
              id={`match-${index}`}
              index={index}
              quinipolo={quinipolo}
              setQuinipolo={setQuinipolo}
              teamOptions={teamOptions}
              selectedTeams={selectedTeams}
              loading={loading}
              allowRepeatedTeams={allowRepeatedTeams}
              onValidationChange={onValidationChange}
              matchErrors={matchErrors}
              isMatch15Locked={isMatch15Locked}
              setIsMatch15Locked={setIsMatch15Locked}
            />
          ))}
        </Box>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <Box
            className={styles.dragOverlay}
            sx={{
              opacity: 0.8,
              transform: "rotate(2deg)",
            }}
          >
            {/* Placeholder for drag overlay - shows a simple indicator */}
            <Box
              sx={{
                padding: 2,
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                minHeight: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t("reordering.dragging") || "Reordering match..."}
            </Box>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
