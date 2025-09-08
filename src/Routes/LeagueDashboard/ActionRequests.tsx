import { Dispatch, SetStateAction, useMemo } from "react";
import { useTranslation } from "react-i18next";
import RequestsTable from "../../Components/RequestsTable/RequestsTable";
import styles from "./LeagueDashboard.module.scss";
import type { LeaguesTypes } from "./LeagueDashboard";

type ActionRequestsProps = {
  leagueId: string;
  leagueData: LeaguesTypes;
  setLeagueData: Dispatch<SetStateAction<LeaguesTypes>>;
  onAfterChange?: () => void;
};

const ActionRequests = ({
  leagueId,
  leagueData,
  setLeagueData,
  onAfterChange,
}: ActionRequestsProps) => {
  const { t } = useTranslation();

  const { participantRequests, moderatorRequests } = useMemo(() => {
    const pendingParticipant =
      leagueData.isPrivate &&
      leagueData.participantPetitions?.filter(
        (petition) => petition.status === "pending"
      );
    const pendingModerator = leagueData.moderatorPetitions?.filter(
      (petition) => petition.status === "pending"
    );
    return {
      participantRequests: pendingParticipant || [],
      moderatorRequests: pendingModerator || [],
    };
  }, [leagueData]);

  const noActions =
    (!participantRequests || participantRequests.length === 0) &&
    (!moderatorRequests || moderatorRequests.length === 0);

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
            setLeagueData={setLeagueData}
            requestType="participant"
            onAfterChange={onAfterChange}
          />
        )}
      {moderatorRequests?.length > 0 && (
        <RequestsTable
          leagueId={leagueId}
          requests={moderatorRequests}
          setLeagueData={setLeagueData}
          requestType="moderator"
          onAfterChange={onAfterChange}
        />
      )}
    </>
  );
};

export default ActionRequests;
