import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SurveyData, TeamOption } from "../../types/quinipolo";
import styles from "./MatchForm.module.scss";
import { useTranslation } from "react-i18next";
import { useTheme as useMuiTheme } from "@mui/material/styles";

interface MatchFormProps {
  teamOptions: { waterpolo: TeamOption[]; football: TeamOption[] };
  selectedTeams: string[];
  index: number;
  setQuinipolo: Dispatch<SetStateAction<SurveyData[]>>;
  loading: boolean;
  allowRepeatedTeams?: boolean;
  onValidationChange?: (matchIndex: number, error: string | null) => void;
}

interface TeamAutocompleteOption {
  key: string;
  label: string;
  team: TeamOption;
  isAlias: boolean;
}

const MatchForm = ({
  teamOptions,
  selectedTeams,
  index,
  setQuinipolo,
  loading,
  allowRepeatedTeams = false,
  onValidationChange,
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
  const [genderError, setGenderError] = useState<string | null>(null);

  const normalizeTeamArray = () =>
    (teamOptions &&
      teamOptions[matchData.gameType as "waterpolo" | "football"]) ||
    [];

  const getTeams = (type: string) => {
    const teamsForSport = normalizeTeamArray();
    return teamsForSport
      .filter((team: TeamOption) => {
        const isTeamUsedInOtherMatches = selectedTeams.includes(team.name);
        const isTeamSelectedInThisMatch =
          team.name ===
          (type === "away" ? matchData.homeTeam : matchData.awayTeam);

        if (isTeamSelectedInThisMatch) return false;
        if (allowRepeatedTeams) return true;
        return !isTeamUsedInOtherMatches;
      })
      .sort(
        (a: TeamOption, b: TeamOption) =>
          -b.name.charAt(0).localeCompare(a.name.charAt(0))
      );
  };

  const findTeamByName = (teamName: string) =>
    normalizeTeamArray().find((team) => team.name === teamName) || null;

  const buildAutocompleteOptions = (type: "home" | "away") => {
    const teams = getTeams(type);
    const canonicalOptions: TeamAutocompleteOption[] = teams.map((team) => ({
      key: `${team.name}::canonical`,
      label: team.name,
      team,
      isAlias: false,
    }));

    const aliasOptions: TeamAutocompleteOption[] = teams.flatMap((team) =>
      (team.aliases ?? []).map((alias) => ({
        key: `${team.name}::alias::${alias}`,
        label: alias,
        team,
        isAlias: true,
      }))
    );

    return [...canonicalOptions, ...aliasOptions];
  };

  const getSelectedOption = (
    teamName: string
  ): TeamAutocompleteOption | null => {
    const team = findTeamByName(teamName);
    if (!team) return null;
    return {
      key: `${team.name}::canonical`,
      label: team.name,
      team,
      isAlias: false,
    };
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
    value: TeamAutocompleteOption | string | null
  ) => {
    const normalizedValue =
      typeof value === "string" ? value : value?.team.name ?? "";
    setMatchData((prevData: SurveyData) => ({
      ...prevData,
      [name]: normalizedValue,
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

  useEffect(() => {
    const homeTeam = findTeamByName(matchData.homeTeam);
    const awayTeam = findTeamByName(matchData.awayTeam);

    if (
      homeTeam?.gender &&
      awayTeam?.gender &&
      homeTeam.gender !== awayTeam.gender
    ) {
      const errorMessage = t("genderMismatchError");
      setGenderError(errorMessage);
      onValidationChange?.(index, errorMessage);
      return;
    }

    setGenderError(null);
    onValidationChange?.(index, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchData.homeTeam, matchData.awayTeam, matchData.gameType, teamOptions]);

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
                options={buildAutocompleteOptions("home")}
                groupBy={(option: TeamAutocompleteOption) =>
                  option.label.charAt(0)
                }
                value={getSelectedOption(matchData.homeTeam)}
                inputValue={matchData.homeTeam}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option?.label ?? ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.key === value?.key
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.label}
                    {option.isAlias && (
                      <Typography
                        component="span"
                        sx={{ ml: 1 }}
                        variant="caption"
                      >
                        ({option.team.name})
                      </Typography>
                    )}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    required
                    {...params}
                    label={t("homeTeam")}
                    variant="outlined"
                    name="homeTeam"
                    error={Boolean(genderError)}
                    fullWidth
                    margin="normal"
                  />
                )}
                onInputChange={(_, newInputValue) =>
                  setMatchData((prevData: SurveyData) => ({
                    ...prevData,
                    homeTeam: newInputValue ?? "",
                  }))
                }
                onChange={(_, value) => handleTeamChange("homeTeam", value)}
              />

              <Autocomplete
                disabled={!matchData.gameType}
                key={`awayTeam-${index}`}
                options={buildAutocompleteOptions("away")}
                freeSolo
                groupBy={(option: TeamAutocompleteOption) =>
                  option.label.charAt(0)
                }
                value={getSelectedOption(matchData.awayTeam)}
                inputValue={matchData.awayTeam}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option?.label ?? ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.key === value?.key
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    {option.label}
                    {option.isAlias && (
                      <Typography
                        component="span"
                        sx={{ ml: 1 }}
                        variant="caption"
                      >
                        ({option.team.name})
                      </Typography>
                    )}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label={t("awayTeam")}
                    variant="outlined"
                    name="awayTeam"
                    error={Boolean(genderError)}
                    fullWidth
                    margin="normal"
                  />
                )}
                onInputChange={(_, newInputValue) =>
                  setMatchData((prevData: SurveyData) => ({
                    ...prevData,
                    awayTeam: newInputValue ?? "",
                  }))
                }
                onChange={(_, value) => handleTeamChange("awayTeam", value)}
              />

              {genderError && (
                <Typography color="error" className={styles.validationMessage}>
                  {genderError}
                </Typography>
              )}
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
