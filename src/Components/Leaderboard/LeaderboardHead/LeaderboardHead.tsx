import { TableCell, TableRow } from "@mui/material";
import { TableHead } from "@mui/material";
import { useTranslation } from "react-i18next";
import style from "../Leaderboard.module.scss";

const LeaderboardHead = () => {
  const { t } = useTranslation();

  return (
    <TableHead className={style.tableHead}>
      <TableRow>
        <TableCell className={style.tableHeadCell}>{t("user")}</TableCell>
        <TableCell className={style.tableHeadCell} align="right">
          {t("points")}
        </TableCell>
      </TableRow>
    </TableHead>
  );
};

export default LeaderboardHead;
