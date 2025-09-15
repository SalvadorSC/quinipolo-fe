import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { SurveyData } from "../../types/quinipolo";
import styles from "./MatchForm.module.scss";
import { useTranslation } from "react-i18next";
import { useTheme as useMuiTheme } from "@mui/material/styles";

interface MatchFormProps {
  teamOptions: { waterpolo: string[]; football: string[] };
  selectedTeams: string[];
  index: number;
  setQuinipolo: Dispatch<SetStateAction<SurveyData[]>>;
  loading: boolean;
  allowRepeatedTeams?: boolean;
}

const MatchForm = ({
  teamOptions,
  selectedTeams,
  index,
  setQuinipolo,
  loading,
  allowRepeatedTeams = false,
}: MatchFormProps) => {
  const { t } = useTranslation();
  const muiTheme = useMuiTheme();
  const initialSurveyData: SurveyData = {
    gameType: "waterpolo",
    homeTeam: "",
    awayTeam: "",
    isGame15: index === 14,
    date: new Date(),
  };
  const [matchData, setMatchData] = useState<SurveyData>(initialSurveyData);

  const getTeams = (type: string) => {
    const teamsForSport =
      (teamOptions &&
        teamOptions[matchData.gameType as "waterpolo" | "football"]) ||
      [];
    return teamsForSport
      .filter((team: string) => {
        const isTeamUsedInOtherMatches = selectedTeams.includes(team);
        const isTeamSelectedInThisMatch =
          team === (type === "away" ? matchData.homeTeam : matchData.awayTeam);

        // Always prevent selecting the same team for both home and away within the same match
        if (isTeamSelectedInThisMatch) return false;

        // If repeating teams across matches is allowed, do not filter out already used teams
        if (allowRepeatedTeams) return true;

        // Otherwise, exclude teams already used in other matches
        return !isTeamUsedInOtherMatches;
      })
      .sort((a: string, b: string) => -b.charAt(0).localeCompare(a.charAt(0)));
  };

  const handleChange = ({
    target: { name, value },
  }:
    | SelectChangeEvent<string>
    | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMatchData((prevData: SurveyData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    setQuinipolo((prevquinipolo) => {
      const updatedData = [...prevquinipolo];
      updatedData[index] = matchData;
      return updatedData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchData]);

  const handleTeamChange = (
    name: "homeTeam" | "awayTeam",
    value: string | null
  ) => {
    setMatchData((prevData: SurveyData) => ({
      ...prevData,
      [name]: value ?? "",
    }));
  };

  let goalsText = t("none");

  if (matchData.gameType) {
    if (matchData.gameType === "waterpolo") {
      goalsText = t("waterpoloGoalsText");
    } else {
      goalsText = t("footballGoalsText");
    }
  }

  return (
    <>
      <Typography className={styles.matchFormTitle}>
        {t("matchNumber", { number: index + 1 })} <br />
      </Typography>
      <br />
      <Box
        className={styles.matchForm}
        key={`matchForm-${index}`}
        sx={{
          backgroundColor:
            muiTheme.palette.mode === "dark" ? "#23272b" : "#fff",
        }}
      >
        <Box>
          <FormControl
            className="matchForm__gameType"
            fullWidth
            variant="outlined"
            margin="normal"
          >
            <InputLabel>{t("sport")}</InputLabel>
            <Select
              label={t("sport")}
              name="gameType"
              value={matchData.gameType}
              onChange={(event) => {
                setMatchData({
                  ...matchData,
                  gameType: event.target.value as "waterpolo" | "football",
                  homeTeam: "",
                  awayTeam: "",
                });
              }}
            >
              <MenuItem value="waterpolo">{t("waterpolo")}</MenuItem>
              <MenuItem value="football">{t("football")}</MenuItem>
            </Select>
          </FormControl>

          {loading ? (
            <>
              <Skeleton variant="rectangular" sx={{ mt: 2 }} height={60} />
              <br />
              <Skeleton variant="rectangular" height={60} />
            </>
          ) : (
            <>
              <Autocomplete
                freeSolo
                disabled={!matchData.gameType}
                key={`homeTeam-${index}`}
                options={getTeams("home")}
                groupBy={(option: string) => option.charAt(0)}
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    label={t("homeTeam")}
                    variant="outlined"
                    name="homeTeam"
                    value={matchData.homeTeam}
                    onChange={(e) => handleChange(e)}
                    fullWidth
                    margin="normal"
                  />
                )}
                onChange={(_, value) => handleTeamChange("homeTeam", value)}
              />

              <Autocomplete
                disabled={!matchData.gameType}
                key={`awayTeam-${index}`}
                options={getTeams("away")}
                freeSolo
                groupBy={(option: string) => option.charAt(0)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label={t("awayTeam")}
                    variant="outlined"
                    name="awayTeam"
                    value={matchData.awayTeam}
                    onChange={(e) => handleChange(e)}
                    fullWidth
                    margin="normal"
                  />
                )}
                onChange={(_, value) => handleTeamChange("awayTeam", value)}
              />
            </>
          )}

          {index === 14 && (
            <div style={{ marginTop: 10 }}>
              <Typography color="text.primary">
                {t("numberOfGoals")}:
              </Typography>
              <br />
              <Typography color="text.primary">{goalsText}</Typography>
            </div>
          )}
        </Box>
      </Box>
    </>
  );
};

export default MatchForm;
