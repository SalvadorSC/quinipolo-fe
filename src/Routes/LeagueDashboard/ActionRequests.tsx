import { Dispatch, SetStateAction, useMemo } from "react";
import { useTranslation } from "react-i18next";
import RequestsTable from "../../Components/RequestsTable/RequestsTable";
import styles from "./LeagueDashboard.module.scss";
import type { LeaguesTypes } from "./LeagueDashboard";

type ActionRequestsProps = {
  leagueId: string;
  leagueData: LeaguesTypes;
  participantPetitions: any[];
  onPetitionAccept: (petitionId: string) => void;
  onPetitionReject: (petitionId: string) => void;
};

const ActionRequests = ({
  leagueId,
  leagueData,
  participantPetitions,
  onPetitionAccept,
  onPetitionReject,
}: ActionRequestsProps) => {
  const { t } = useTranslation();

  const { participantRequests } = useMemo(() => {
    const pendingParticipant =
      leagueData.isPrivate &&
      participantPetitions?.filter((petition) => petition.status === "pending");
    return {
      participantRequests: pendingParticipant || [],
    };
  }, [leagueData.isPrivate, participantPetitions]);

  const noActions = !participantRequests || participantRequests.length === 0;

  if (noActions) {
    return (
      <div className={styles.noActionsToHandle}>{t("noActionsToHandle")}</div>
    );
  }

  return (
    <>
      {leagueData.isPrivate &&
        participantRequests &&
        participantRequests.length > 0 && (
          <RequestsTable
            leagueId={leagueId}
            requests={participantRequests}
            requestType="participant"
            onAccept={onPetitionAccept}
            onReject={onPetitionReject}
          />
        )}
    </>
  );
};

export default ActionRequests;
