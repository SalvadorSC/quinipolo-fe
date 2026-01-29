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
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { SurveyData, TeamOption } from "../../types/quinipolo";
import styles from "./MatchForm.module.scss";
import { useTranslation } from "react-i18next";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { leagues } from "../../services/scraper/config";

interface MatchFormProps {
  teamOptions: { waterpolo: TeamOption[]; football: TeamOption[] };
  selectedTeams: string[];
  index: number;
  setQuinipolo: Dispatch<SetStateAction<SurveyData[]>>;
  loading: boolean;
  allowRepeatedTeams?: boolean;
  onValidationChange?: (matchIndex: number, error: string | null) => void;
  value?: SurveyData; // Optional controlled value from parent
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
  value,
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
  const [matchData, setMatchData] = useState<SurveyData>(
    value || initialSurveyData
  );
  const [genderError, setGenderError] = useState<string | null>(null);
  const isUpdatingFromParentRef = useRef(false);
  const lastValueRef = useRef<SurveyData | undefined>(value);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state when value prop changes (for controlled mode)
  // Only update if the value actually changed and we're not in the middle of a local update
  useEffect(() => {
    if (value && !isUpdatingFromParentRef.current) {
      // Deep comparison to avoid unnecessary updates
      const valueChanged =
        !lastValueRef.current ||
        value.homeTeam !== lastValueRef.current.homeTeam ||
        value.awayTeam !== lastValueRef.current.awayTeam ||
        value.gameType !== lastValueRef.current.gameType ||
        value.leagueId !== lastValueRef.current.leagueId;
      
      if (valueChanged) {
        isUpdatingFromParentRef.current = true;
        setMatchData(value);
        lastValueRef.current = value;
        
        // Clear any pending timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        // Reset flag after state update completes
        updateTimeoutRef.current = setTimeout(() => {
          isUpdatingFromParentRef.current = false;
          updateTimeoutRef.current = null;
        }, 0);
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [value]);

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
    if (!teamName) return null;
    
    const team = findTeamByName(teamName);
    if (!team) {
      // If team name doesn't match exactly, check if it matches an alias
      const teamsForSport = normalizeTeamArray();
      const teamWithAlias = teamsForSport.find((t) => 
        t.aliases?.some(alias => alias === teamName)
      );
      
      if (teamWithAlias) {
        return {
          key: `${teamWithAlias.name}::alias::${teamName}`,
          label: teamName,
          team: teamWithAlias,
          isAlias: true,
        };
      }
      
      // Return null for free text that doesn't match any team
      return null;
    }
    
    return {
      key: `${team.name}::canonical`,
      label: team.name,
      team,
      isAlias: false,
    };
  };

  // Update parent state when matchData changes, but avoid loops
  useEffect(() => {
    // Skip update if we're currently syncing from parent
    if (isUpdatingFromParentRef.current) {
      return;
    }
    
    setQuinipolo((prevquinipolo) => {
      const currentMatch = prevquinipolo[index];
      // Only update if the data actually changed
      if (
        currentMatch?.homeTeam === matchData.homeTeam &&
        currentMatch?.awayTeam === matchData.awayTeam &&
        currentMatch?.gameType === matchData.gameType &&
        currentMatch?.leagueId === matchData.leagueId
      ) {
        return prevquinipolo;
      }
      
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
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
              marginTop: 2,
              marginBottom: 1,
            }}
          >
            <FormControl
              className="matchForm__gameType"
              sx={{ flex: 1 }}
              variant="outlined"
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
                    leagueId:
                      event.target.value === "waterpolo"
                        ? matchData.leagueId
                        : undefined,
                  });
                }}
              >
                <MenuItem value="waterpolo">{t("waterpolo")}</MenuItem>
                <MenuItem value="football">{t("football")}</MenuItem>
              </Select>
            </FormControl>

            {matchData.gameType === "waterpolo" && (
              <FormControl
                className="matchForm__league"
                sx={{ minWidth: 120 }}
                variant="outlined"
              >
                <InputLabel>{t("league")}</InputLabel>
                <Select
                  label={t("league")}
                  name="leagueId"
                  value={matchData.leagueId || ""}
                  onChange={(event) => {
                    setMatchData({
                      ...matchData,
                      leagueId: event.target.value || undefined,
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>{t("none")}</em>
                  </MenuItem>
                  {leagues.map((league) => (
                    <MenuItem key={league.id} value={league.id}>
                      {league.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

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
                onInputChange={(_, newInputValue) => {
                  // Only update if we're not syncing from parent
                  if (!isUpdatingFromParentRef.current) {
                    setMatchData((prevData: SurveyData) => ({
                      ...prevData,
                      homeTeam: newInputValue ?? "",
                    }));
                  }
                }}
                onChange={(_, value) => {
                  if (!isUpdatingFromParentRef.current) {
                    handleTeamChange("homeTeam", value);
                  }
                }}
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
                onInputChange={(_, newInputValue) => {
                  // Only update if we're not syncing from parent
                  if (!isUpdatingFromParentRef.current) {
                    setMatchData((prevData: SurveyData) => ({
                      ...prevData,
                      awayTeam: newInputValue ?? "",
                    }));
                  }
                }}
                onChange={(_, value) => {
                  if (!isUpdatingFromParentRef.current) {
                    handleTeamChange("awayTeam", value);
                  }
                }}
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
