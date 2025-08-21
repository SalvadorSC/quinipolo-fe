import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { CircularProgress, Paper, Box } from "@mui/material";
import styles from "./Dashboard.module.scss";
import { LoadingButton } from "@mui/lab";
import QuinipolosToAnswer from "../../Components/QuinipolosToAnswer/QuinipolosToAnswer";
import {
  UserDataType,
  useUser as useUserData,
} from "../../Context/UserContext/UserContext";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import WavesIcon from "@mui/icons-material/Waves";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import PoolIcon from "@mui/icons-material/Pool";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../utils/apiUtils";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, updateUser } = useUserData();
  const [leagues, setLeagues] = useState<
    { leagueId: string; leagueName: string; participants: string[] }[]
  >([]);
  const { t } = useTranslation();
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);

  const returnRandomIcon = () => {
    const iconStyle = {
      color: "#3f51b5",
    };
    const icons = [
      <SportsVolleyballIcon key="SportsVolleyball" style={iconStyle} />,
      <WavesIcon key={"Waves"} style={iconStyle} />,
      <SportsBarIcon key="SportsBar" style={iconStyle} />,
      <PoolIcon key="Pool" style={iconStyle} />,
    ];
    return (
      <Box
        sx={{
          marginLeft: "10px",
          width: "40px",
          background: "#ddd",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "40px",
          borderRadius: "50%",
        }}
      >
        {icons[Math.floor(Math.random() * icons.length)]}
      </Box>
    );
  };

  useEffect(() => {
    if (
      !hasFetchedProfile &&
      userData.isAuthenticated &&
      (!userData.leagues || userData.leagues.length === 0)
    ) {
      apiGet<UserDataType>("/api/users/me/profile")
        .then((profile) => {
          const leagues = profile.leagues || [];
          leagues.sort((a, b) =>
            a.leagueId === "global" ? -1 : b.leagueId === "global" ? 1 : 0
          );
          updateUser({
            leagues,
            role: profile.role,
            username: profile.username,
          });
          setHasFetchedProfile(true);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          // If it's an authentication error, redirect to login
          if (error.response?.status === 401) {
            window.location.href = "/sign-in";
          }
        });
    }
  }, [
    userData.leagues,
    userData.isAuthenticated,
    updateUser,
    hasFetchedProfile,
  ]);

  const getLeaguesData = useCallback(async () => {
    const leaguesData = await Promise.all(
      userData.leagues.map((league) => {
        return apiGet<any>(`/api/leagues/${league}`).then((leagueData) => {
          return leagueData;
        });
      })
    );

    const leaguesWithData = leaguesData.map((league) => {
      return {
        leagueId: league.id,
        leagueName: league.league_name,
        participants: league.participants,
      };
    });
    setLeagues(leaguesWithData);
  }, [userData.leagues]);

  useEffect(() => {
    if (userData.leagues.length > 0) {
      getLeaguesData();
    }
  }, [getLeaguesData, userData.leagues.length]);

  return (
    <div className={styles.dashboardContainer}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: window.innerWidth > 400 ? 4 : 2,
          borderRadius: "20px",
        }}
      >
        <div className={styles.container}>
          <h2
            className={styles.leaguesTitle}
            style={{ marginTop: 0, borderBottom: "1px solid #e0e0e0" }}
          >
            {t("quinipolos")}
          </h2>
          <QuinipolosToAnswer appLocation="user-dashboard" />
          <div className={styles.leaguesContainer}>
            <h2 className={styles.leaguesTitle}>{t("myLeagues")}</h2>
            {userData.role === "" ? (
              <CircularProgress sx={{ mt: 4 }} />
            ) : userData.leagues.length === 0 ? (
              <p className={styles.noActionsMessage}>{t("noLeagues")}</p>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {leagues.map((league) => (
                  <Button
                    className="gradient-primary"
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      padding: "10px",
                      minHeight: "60px",
                    }}
                    key={league.leagueId}
                    onClick={() => {
                      navigate(`/league-dashboard?id=${league.leagueId}`);
                    }}
                    variant={"contained"}
                  >
                    <>
                      {returnRandomIcon()}
                      <p
                        style={{
                          marginLeft: "20px",
                        }}
                      >
                        <b>{league.leagueName}</b>
                      </p>
                    </>
                  </Button>
                ))}
              </Box>
            )}
            <h2 className={styles.leaguesTitle}>{t("actions")}</h2>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Button
                className="gradient-secondary"
                variant="contained"
                color="primary"
                size="large"
                onClick={() => {
                  navigate("/join-league");
                }}
                style={{ width: "100%" }}
              >
                {t("viewAllLeagues")}
              </Button>

              <LoadingButton
                className="gradient-secondary"
                loading={userData.role === ""}
                variant="contained"
                color="primary"
                onClick={() => {
                  navigate("/create-league");
                }}
                size="large"
                style={{
                  marginRight: "20px",
                  width: "100%",
                }}
              >
                {t("createLeague")}
              </LoadingButton>
            </Box>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default Dashboard;
