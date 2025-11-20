// SurveyForm.tsx
import React, { useState, FormEvent, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { SurveyData, TeamOptionsBySport } from "../../types/quinipolo";
import MatchForm from "../../Components/MatchForm/MatchForm";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import locale from "antd/es/date-picker/locale/es_ES";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import styles from "./SurveyForm.module.scss";
import HowQuinipoloWorksModal from "./HowQuinipoloWorksModal";
import { useNavigate } from "react-router-dom";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../utils/apiUtils";
import { MatchAutoFillModal } from "./MatchAutoFillModal";
import { ScraperMatchV2 } from "../../services/scraper/types";
import { useUser } from "../../Context/UserContext/UserContext";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const SurveyForm = () => {
  const navigate = useNavigate();
  const { setFeedback } = useFeedback();
  const { userData } = useUser();
  const [quinipolo, setQuinipolo] = useState<SurveyData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoFillModalOpen, setAutoFillModalOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [teamOptions, setTeamOptions] = useState<TeamOptionsBySport>({
    waterpolo: [],
    football: [],
  });
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [allowRepeatedTeams, setAllowRepeatedTeams] = useState<boolean>(false);
  const [matchErrors, setMatchErrors] = useState<Record<number, string | null>>(
    {}
  );

  // Check if this is for all leagues
  const isForAllLeagues =
    new URLSearchParams(window.location.search).get("allLeagues") === "true";

  // Check if this is for managed leagues only
  const isForManagedLeagues =
    new URLSearchParams(window.location.search).get("managedLeagues") ===
    "true";

  const selectedTeams = quinipolo
    .map((match) => match.awayTeam)
    .concat(quinipolo.map((match) => match.homeTeam));
  const { t } = useTranslation();

  const handleDateChange: (
    date: Dayjs | null,
    dateString: string | string[]
  ) => void = (date, dateString) => {
    const dateStringSingle = Array.isArray(dateString)
      ? dateString[0] || ""
      : dateString;
    const parsed = date
      ? date.toDate()
      : dayjs(dateStringSingle, "DD/MM/YYYY hh:mm").toDate();
    setSelectedDate(parsed);
  };

  const handleHelpClick = () => {
    setHelpModalOpen(true);
  };

  const handleCloseHelpModal = () => {
    setHelpModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(window.location.search);
    const leagueId = queryParams.get("leagueId");

    try {
      if (hasBlockingErrors) {
        setFeedback({
          message: t("genderMismatchSubmitError"),
          severity: "error",
          open: true,
        });
        window.scrollTo(0, 0);
        return;
      }

      if (selectedDate === null || selectedDate < new Date()) {
        setFeedback({
          message: t("selectDateTimeForQuinipolo"),
          severity: "error",
          open: true,
        });
        window.scrollTo(0, 0);
        return;
      }

      // Set loading state to prevent multiple submissions
      setLoading(true);

      // Determine the API endpoint based on the type of creation
      let endpoint = "/api/quinipolos";
      let requestBody: any = {
        league_id: leagueId,
        quinipolo,
        end_date: selectedDate,
        creation_date: new Date(),
      };

      if (isForAllLeagues) {
        endpoint = "/api/quinipolos/all-leagues";
        requestBody = {
          quinipolo,
          end_date: selectedDate,
          creation_date: new Date(),
        };
      } else if (isForManagedLeagues) {
        endpoint = "/api/quinipolos/managed-leagues";
        requestBody = {
          quinipolo,
          end_date: selectedDate,
          creation_date: new Date(),
        };
      }

      // Create quinipolo via backend API
      const response = await apiPost<any>(endpoint, requestBody);

      let successMessage = t("quinipoloCreatedSuccess");
      if (isForAllLeagues) {
        successMessage = `Successfully created quinipolos for ${response.successfulCreations} out of ${response.totalLeagues} leagues`;
      } else if (isForManagedLeagues) {
        successMessage = `Successfully created quinipolos for ${response.successfulCreations} out of ${response.totalLeagues} managed leagues`;
      }

      setFeedback({
        message: successMessage,
        severity: "success",
        open: true,
      });

      // Navigate based on the type of creation
      if (isForAllLeagues || isForManagedLeagues) {
        navigate("/dashboard");
      } else {
        navigate("/quinipolo-success", { state: { quinipolo: response } });
      }
    } catch (error) {
      setFeedback({
        message: t("errorCreatingQuinipolo"),
        severity: "error",
        open: true,
      });
      console.error("Error creating Quinipolo:", error);
    } finally {
      // Always reset loading state, even if there's an error
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    const fetchTeams = async () => {
      try {
        // Use only the backend API since Supabase teams calls are failing
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/teams/all`
        );
        if (!response.ok) {
          throw new Error(`Backend API failed: ${response.status}`);
        }
        const backendTeams = await response.json();
        const normalizedTeams: TeamOptionsBySport = {
          waterpolo: Array.isArray(backendTeams?.waterpolo)
            ? backendTeams.waterpolo.map((team: any) => ({
                name: typeof team === "string" ? team : team.name,
                sport: "waterpolo" as const,
                gender: team?.gender ?? null,
                aliases: Array.isArray(team?.alias)
                  ? team.alias
                  : Array.isArray(team?.aliases)
                  ? team.aliases
                  : [],
              }))
            : [],
          football: Array.isArray(backendTeams?.football)
            ? backendTeams.football.map((team: any) => ({
                name: typeof team === "string" ? team : team.name,
                sport: "football" as const,
                gender: team?.gender ?? null,
                aliases: Array.isArray(team?.alias)
                  ? team.alias
                  : Array.isArray(team?.aliases)
                  ? team.aliases
                  : [],
              }))
            : [],
        };
        setTeamOptions(normalizedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setFeedback({
          message: "Error loading teams",
          severity: "error",
          open: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [setFeedback]);

  const matchArray = new Array(15).fill(null);

  const handleMatchValidationChange = (
    matchIndex: number,
    error: string | null
  ) => {
    setMatchErrors((prev) => {
      if (prev[matchIndex] === error) {
        return prev;
      }
      return { ...prev, [matchIndex]: error };
    });
  };

  const handleAutoFillConfirm = ({
    matches,
    plenoMatchId,
  }: {
    matches: ScraperMatchV2[];
    plenoMatchId: string | null;
  }) => {
    const converted = buildSurveyDataFromSelection(matches, plenoMatchId);
    setQuinipolo(converted);
    setMatchErrors({});

    if (matches.length === 15) {
      const earliest = matches
        .map((match) => new Date(match.startTime))
        .sort((a, b) => a.getTime() - b.getTime())[0];
      setSelectedDate(earliest ?? null);
    } else {
      setSelectedDate(null);
    }

    setFeedback({
      message: t("autoFillSuccess") || "Survey form filled successfully!",
      severity: "success",
      open: true,
    });
  };

  const hasBlockingErrors = Object.values(matchErrors).some(Boolean);

  // Check if user is info@quinipolo.com
  const isAdminUser = userData.emailAddress === "info@quinipolo.com";

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div
        style={{
          color: "white",
          display: "flex",
          alignItems: "center",
          marginTop: 60,
          marginBottom: 30,
          justifyContent: "space-between",
          padding: 26,
        }}
      >
        <h2>{t("createQuinipolo")}</h2>
        <HelpOutlineRoundedIcon
          onClick={handleHelpClick}
          style={{ cursor: "pointer" }}
        />
      </div>

      <p className={styles.dateTimeDisclaimer}>{t("dateTimeDisclaimer")}</p>
      <div className={styles.datePickerContainer}>
        <DatePicker
          format="DD/MM/YYYY HH:mm"
          onChange={handleDateChange}
          locale={locale}
          placeholder={t("date")}
          className={styles.datePicker}
          showNow={false}
          popupClassName={styles.datePickerPopup}
          showTime={{ format: "HH:mm" }}
          value={selectedDate ? dayjs(selectedDate) : null}
        />
      </div>
      {isAdminUser && (
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setAutoFillModalOpen(true)}
            disabled={loading}
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {t("autoFillSurvey") || "Auto-fill Survey"}
          </Button>
        </div>
      )}
      <FormControlLabel
        control={
          <Switch
            checked={allowRepeatedTeams}
            onChange={(e) => setAllowRepeatedTeams(e.target.checked)}
            color="primary"
          />
        }
        style={{ color: "white", marginLeft: 2, marginTop: 16 }}
        label={t("allowRepeatTeams")}
      />
      {matchArray.map((_, index) => (
        <MatchForm
          key={index}
          teamOptions={teamOptions}
          selectedTeams={allowRepeatedTeams ? [] : selectedTeams}
          index={index}
          setQuinipolo={setQuinipolo}
          loading={loading}
          allowRepeatedTeams={allowRepeatedTeams}
          onValidationChange={handleMatchValidationChange}
          value={quinipolo[index]}
        />
      ))}

      <div className={styles.submitButton}>
        <Button
          type="submit"
          disabled={loading || hasBlockingErrors}
          variant="contained"
          color="primary"
        >
          {loading ? t("creatingQuinipolo") : t("createQuinipolo")}
        </Button>
      </div>

      {/* Help Modal */}
      <HowQuinipoloWorksModal
        open={helpModalOpen}
        onClose={handleCloseHelpModal}
      />
      <MatchAutoFillModal
        open={autoFillModalOpen}
        onClose={() => setAutoFillModalOpen(false)}
        onConfirm={({ matches, plenoMatchId }) => {
          handleAutoFillConfirm({ matches, plenoMatchId });
          setAutoFillModalOpen(false);
        }}
      />
    </form>
  );
};

export default SurveyForm;

function buildSurveyDataFromSelection(
  matches: ScraperMatchV2[],
  plenoMatchId: string | null
): SurveyData[] {
  if (!matches.length) {
    return new Array(15).fill(null).map((_, index) => ({
      gameType: "waterpolo",
      homeTeam: "",
      awayTeam: "",
      date: new Date(),
      isGame15: index === 14,
    }));
  }

  const sorted = [...matches].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  if (plenoMatchId) {
    const plenoIndex = sorted.findIndex(
      (match) => match.matchId === plenoMatchId
    );
    if (plenoIndex > -1) {
      const [plenoMatch] = sorted.splice(plenoIndex, 1);
      sorted.push(plenoMatch);
    }
  }

  const surveyMatches: SurveyData[] = sorted.slice(0, 15).map(() => ({
    gameType: "waterpolo",
    homeTeam: "",
    awayTeam: "",
    date: new Date(),
    isGame15: false,
  }));

  sorted.slice(0, 15).forEach((match, index) => {
    surveyMatches[index] = {
      gameType: "waterpolo",
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      date: new Date(match.startTime),
      isGame15: false,
    };
  });

  while (surveyMatches.length < 15) {
    surveyMatches.push({
      gameType: "waterpolo",
      homeTeam: "",
      awayTeam: "",
      date: new Date(),
      isGame15: false,
    });
  }

  if (surveyMatches.length > 0) {
    surveyMatches.forEach((match, index) => {
      match.isGame15 = index === surveyMatches.length - 1;
    });
  }

  return surveyMatches;
}
