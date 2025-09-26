import { Box, Pagination, Tab } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "../../Context/UserContext/UserContext";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { apiGet } from "../../utils/apiUtils";
import Skeleton from "antd/lib/skeleton";
import { useTranslation } from "react-i18next";
import {
  filterPendingQuinipolos,
  filterPreviousQuinipolos,
  filterAllQuinipolos,
} from "../../utils/quinipoloFilters";

import { TabContext, TabList, TabPanel } from "@mui/lab";
import QuinipoloCard from "../QuinipoloCard/QuinipoloCard";
import styles from "./QuinipolosToAnswer.module.scss";
import {
  QuinipolosToAnswerProps,
  QuinipoloType,
  TabPanelContentProps,
} from "../../types/quinipolo";

const QuinipolosToAnswer = ({
  leagueId,
  wrapperLoading = false,
  appLocation,
}: QuinipolosToAnswerProps) => {
  const {
    userData: { userLeagues, username },
  } = useUser();

  const [value, setValue] = useState<string>("1");
  const { setFeedback } = useFeedback();
  const [loading, setLoading] = useState<boolean>(false);
  const [quinipolos, setQuinipolos] = useState<QuinipoloType[]>([]);
  const { t } = useTranslation();

  const fetchQuinipolos = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        let data: any;
        if (appLocation === "league-dashboard") {
          data = await apiGet(
            `/api/leagues/league/${leagueId}/leagueQuinipolos`
          );
        } else {
          data = await apiGet(`/api/users/me/quinipolos`);
        }
        // Ensure newest to oldest ordering by end_date
        const sortedData = Array.isArray(data)
          ? [...data].sort((a, b) => {
              const aTime = new Date(a.end_date).getTime();
              const bTime = new Date(b.end_date).getTime();
              return bTime - aTime;
            })
          : data;
        setQuinipolos(sortedData);
      } catch (error) {
        console.error(error);
        setFeedback({
          message: t("error"),
          severity: "error",
          open: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [appLocation, leagueId, setFeedback, t]
  );

  useEffect(() => {
    if (username) {
      fetchQuinipolos(username);
    }
  }, [fetchQuinipolos, username]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          typography: "body1",
          mt: loading || wrapperLoading ? 2 : 0,
        }}
      >
        {loading || wrapperLoading ? (
          <Skeleton />
        ) : (
          <TabContext value={value}>
            <TabList onChange={handleChange} aria-label="Quinipolos">
              <Tab label={t("pending")} value="1" />
              <Tab label={t("previous")} value="2" />
              <Tab label={t("all")} value="3" />
            </TabList>
            <TabPanel sx={{ p: 0, mt: 2 }} value="1">
              <TabPanelContent
                quinipolos={filterPendingQuinipolos(quinipolos, {
                  userLeagues,
                  username,
                })}
                fallBackText={t("noPendingQuinipolos")}
                username={username}
                userLeagues={userLeagues}
              />
            </TabPanel>
            <TabPanel sx={{ p: 0, mt: 2 }} value="2">
              <TabPanelContent
                quinipolos={filterPreviousQuinipolos(quinipolos, {
                  leagueId,
                  userLeagues,
                  username,
                })}
                username={username}
                userLeagues={userLeagues}
                fallBackText={t("noPreviousQuinipolos")}
              />
            </TabPanel>
            <TabPanel sx={{ p: 0, mt: 2 }} value="3">
              <TabPanelContent
                quinipolos={quinipolos}
                username={username}
                userLeagues={userLeagues}
                fallBackText={t("noQuinipolos")}
              />
            </TabPanel>
          </TabContext>
        )}
      </Box>
    </>
  );
};

const TabPanelContent = ({
  quinipolos,
  username,
  userLeagues,
  fallBackText,
}: TabPanelContentProps) => {
  const itemsPerPage = 2;
  const totalItems = quinipolos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = quinipolos.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (e: any, page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      {quinipolos.length > 0 ? (
        currentItems.map((quinipolo) => {
          const deadline = new Date(quinipolo.end_date);
          const deadlineIsInPast = deadline.getTime() < new Date().getTime();
          return (
            <QuinipoloCard
              key={quinipolo.id}
              deadlineIsInPast={deadlineIsInPast}
              quinipolo={quinipolo}
              userLeagues={userLeagues}
              username={username}
            />
          );
        })
      ) : (
        <p className={styles.noActionsMessage}>{fallBackText}</p>
      )}
      {totalPages > 1 ? (
        <Pagination
          onChange={handlePageChange}
          count={totalPages}
          className={styles.pagination}
        />
      ) : null}
    </>
  );
};

export default QuinipolosToAnswer;
