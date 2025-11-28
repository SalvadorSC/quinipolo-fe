import React from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "antd";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import style from "../AnswersForm.module.scss";
import { LeagueChip } from "../../../Components/LeagueChip/LeagueChip";

interface MatchHeaderProps {
  matchNumber: number;
  isGame15: boolean;
  answerModeOn: boolean;
  leagueId?: string;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({
  matchNumber,
  isGame15,
  answerModeOn,
  leagueId,
}) => {
  const { t } = useTranslation();

  if (isGame15 && answerModeOn) {
    return (
      <div className={style.matchNameContainer}>
        <p>{t("game15")}</p>
        <Tooltip title={t("game15help")}>
          <HelpOutlineRoundedIcon style={{ cursor: "pointer" }} />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={style.matchNameContainer}>
      <p className={style.matchName}>
        {t("match")} {matchNumber}
      </p>
      {leagueId && (
        <LeagueChip
          leagueId={leagueId}
          size="small"
          className={style.leagueBadge}
        />
      )}
    </div>
  );
};
