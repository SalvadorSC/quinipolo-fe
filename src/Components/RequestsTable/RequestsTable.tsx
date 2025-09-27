import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import dayjs from "dayjs";
import style from "./RequestsTable.module.scss";
import CheckIcon from "@mui/icons-material/Check";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

interface IRequest {
  userId: string;
  username: string;
  date: Date;
  _id: string;
}

interface IRequestsTable {
  requests: IRequest[];
  leagueId: string;
  requestType: "moderator" | "participant";
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const RequestsTable = ({
  requests,
  leagueId,
  requestType,
  onAccept,
  onReject,
}: IRequestsTable) => {
  const { t } = useTranslation();

  const handleAccept = (id: string) => {
    onAccept(id);
  };

  const handleReject = (id: string) => {
    onReject(id);
  };

  return (
    <Accordion sx={{ m: 0 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        sx={{ textAlign: "left" }}
      >
        {t("pendingRequestsTitle")} ({requests.length})
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {requests.length > 0 ? (
          <TableContainer
            className={style.tableContainer}
            sx={{ borderRadius: "0" }}
            component={Paper}
          >
            <Table aria-label={`${requestType} requests table`}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "600" }}>{t("user")}</TableCell>
                  <TableCell sx={{ fontWeight: "600" }}>
                    {t("requestDate")}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "600" }}
                    className={style.actionColumn}
                  >
                    {t("actionsHeader")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.userId}>
                    <TableCell>@{request.username}</TableCell>
                    <TableCell>
                      {dayjs(request.date).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className={style.actionColumn}>
                      <Button
                        className={`${style.buttonAction} ${style.buttonAccept} gradient-mint`}
                        variant="contained"
                        color="primary"
                        onClick={() => handleAccept(request._id)}
                      >
                        {t("accept")} <CheckIcon />
                      </Button>
                      <Button
                        className={`${style.buttonAction} ${style.buttonReject}`}
                        variant="contained"
                        color="secondary"
                        onClick={() => handleReject(request._id)}
                      >
                        {t("reject")} <DoDisturbIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p className={style.noActionsMessage}>{t("noRequestsToModerate")}</p>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default RequestsTable;
