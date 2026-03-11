import React, { useState } from "react";
import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { apiPost } from "../../utils/apiUtils";

/** All teams from teamNameToImage + teams_logos/teams_logos1 - for logo audit */
const ALL_TEAMS_FOR_LOGO_AUDIT = [
  "A.E. Santa Eulàlia F",
  "C.C Ciudad de Alcorcon F",
  "Apollon Smyrnis M",
  "A.R. Concepción Ciudad Lineal F",
  "C.N. Badia M",
  "Boadilla",
  "A.N. Brescia",
  "CN Caballa Ceuta",
  "CN Catalunya",
  "C.N. Ciutat de Palma F",
  "CN Atlètic-Barceloneta",
  "CN Barcelona",
  "C.N. Cuatro Caminos F",
  "C. Waterpolo Dos Hermanas F",
  "Waterpolo Tenerife Echeyde",
  "C. Waterpolo Elx F",
  "C.N. Godella F",
  "C.N. Granollers F",
  "C.N. Helios M",
  "C.N. Las Palmas M",
  "Málaga",
  "C.N. Marseille M",
  "CN Mataró",
  "CN Mediterrani",
  "C.N. Metropole M",
  "C.N. Molins de Rei F",
  "C.N. Montjuïc F",
  "C.C. Napoli",
  "C. Waterpolo Navarra M",
  "Club Waterpolo Pontevedra",
  "C. Waterpolo Sevilla F",
  "C.D. Waterpolo Turia F",
  "C.N Manresa M",
  "C.N. Poble Nou F",
  "C.N. Premià M",
  "CN Rubí",
  "CN Sabadell",
  "CN Sant Feliu",
  "CN Sant Andreu",
  "CN Terrassa",
  "UE Horta",
  "C.N. Vallirana F",
  "Olympiacos",
  "Ferencvarosi",
  "Pro Recco",
  "Jadran HN",
  "Barceloneta",
  "Horta",
  "Barcelona",
  "Sabadell",
  "Terrassa",
  "Sant Feliu",
  "Catalunya",
  "Echeyde",
  "Brescia",
  "Marseille",
  "APOEL",
  "Banja Luka",
  "Buducnost",
  "Dinamo Tbilisi",
  "Crvena Zvezda",
  "Jug Dubrovnik",
  "Greece",
  "Serbia",
  "Croatia",
];

/** Scrambled scores for logo-audit mock (results don't matter) */
const SCRAMBLED_SCORES = [
  [12, 9], [15, 11], [8, 14], [10, 7], [13, 16], [11, 10], [14, 12],
  [9, 8], [17, 6], [10, 13], [15, 11], [7, 9], [12, 14], [11, 16], [8, 10],
];

const LEAGUES = ["DHF", "DHF", "DHM", "DHM", "DHM", "DHM", "CLF", "DHF", "PDM", "PDM", "PDM", "PDF", "PDF", "PDF", "PLENO_15"];

/** Build all-teams mock for templates 1 & 2 - uses diverse teams to audit logo resolution */
function buildAllTeamsMockPayload(): typeof MOCK_PAYLOAD {
  const shuffled = [...ALL_TEAMS_FOR_LOGO_AUDIT].sort(() => Math.random() - 0.5);
  const quinipolo = Array.from({ length: 15 }, (_, i) => ({
    gameType: "waterpolo" as const,
    homeTeam: shuffled[(i * 2) % shuffled.length],
    awayTeam: shuffled[(i * 2 + 1) % shuffled.length],
    leagueId: LEAGUES[i],
    isGame15: i === 14,
  }));
  const correct_answers = quinipolo.map((m, i) => ({
    matchNumber: i + 1,
    chosenWinner: m.homeTeam,
    goalsHomeTeam: String(SCRAMBLED_SCORES[i][0]),
    goalsAwayTeam: String(SCRAMBLED_SCORES[i][1]),
  }));
  return {
    ...MOCK_PAYLOAD,
    _meta: { ...MOCK_PAYLOAD._meta, includeLogoAudit: true },
    rawBeResponses: {
      ...MOCK_PAYLOAD.rawBeResponses,
      correctionSee: { quinipolo, correct_answers },
    },
  };
}

const MOCK_PAYLOAD: {
  _meta: {
    matchday: string;
    quinipoloId: string;
    leagueId: string;
    includeLogoAudit?: boolean;
  };
  rawBeResponses: Record<string, unknown>;
  image3_quinipoloRanking?: unknown;
  image4_generalLeagueRanking?: unknown;
  image5_statistics?: unknown;
} = {
  _meta: {
    matchday: "J16",
    quinipoloId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    leagueId: "351a1949-f6c5-4940-ac70-1c7dd08e8b1a",
  },
  rawBeResponses: {
    correctionSee: {
      quinipolo: [
        { gameType: "waterpolo", homeTeam: "CN Catalunya", awayTeam: "UE Horta", leagueId: "DHF", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Mataró", awayTeam: "CN Sant Feliu", leagueId: "DHF", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Caballa Ceuta", awayTeam: "CN Terrassa", leagueId: "DHM", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Sabadell", awayTeam: "CN Barcelona", leagueId: "DHM", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Sant Andreu", awayTeam: "CN Catalunya", leagueId: "DHM", isGame15: false },
        { gameType: "waterpolo", homeTeam: "Waterpolo Tenerife Echeyde", awayTeam: "CN Rubí", leagueId: "DHM", isGame15: false },
        { gameType: "waterpolo", homeTeam: "UVSE Margitsziget", awayTeam: "Olympiacos", leagueId: "CLF", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Terrassa", awayTeam: "CN Mediterrani", leagueId: "DHF", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Atlètic-Barceloneta", awayTeam: "CAX", leagueId: "PDM", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Sabadell", awayTeam: "CN Sant Andreu", leagueId: "PDM", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Rubí", awayTeam: "CN Catalunya", leagueId: "PDM", isGame15: false },
        { gameType: "waterpolo", homeTeam: "Club Waterpolo Pontevedra", awayTeam: "CN Joventut", leagueId: "PDF", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Rubí", awayTeam: "CN Catalunya", leagueId: "PDF", isGame15: false },
        { gameType: "waterpolo", homeTeam: "Boadilla", awayTeam: "Málaga", leagueId: "PDF", isGame15: false },
        { gameType: "waterpolo", homeTeam: "CN Sant Feliu", awayTeam: "UE Horta", leagueId: "PLENO_15", isGame15: true },
      ],
      correct_answers: [
        { matchNumber: 1, chosenWinner: "CN Catalunya", goalsHomeTeam: "20", goalsAwayTeam: "11" },
        { matchNumber: 2, chosenWinner: "CN Sant Feliu", goalsHomeTeam: "12", goalsAwayTeam: "14" },
        { matchNumber: 3, chosenWinner: "CN Terrassa", goalsHomeTeam: "14", goalsAwayTeam: "18" },
        { matchNumber: 4, chosenWinner: "CN Sabadell", goalsHomeTeam: "18", goalsAwayTeam: "17", regularGoalsHomeTeam: "14", regularGoalsAwayTeam: "14" },
        { matchNumber: 5, chosenWinner: "CN Catalunya", goalsHomeTeam: "13", goalsAwayTeam: "19" },
        { matchNumber: 6, chosenWinner: "empat", goalsHomeTeam: null, goalsAwayTeam: null, cancelled: true },
        { matchNumber: 7, chosenWinner: "UVSE Margitsziget", goalsHomeTeam: "16", goalsAwayTeam: "15" },
        { matchNumber: 8, chosenWinner: "CN Mediterrani", goalsHomeTeam: "11", goalsAwayTeam: "10" },
        { matchNumber: 9, chosenWinner: "CN Atlètic-Barceloneta", goalsHomeTeam: "14", goalsAwayTeam: "7" },
        { matchNumber: 10, chosenWinner: "CN Sabadell", goalsHomeTeam: "15", goalsAwayTeam: "12" },
        { matchNumber: 11, chosenWinner: "CN Catalunya", goalsHomeTeam: "9", goalsAwayTeam: "8" },
        { matchNumber: 12, chosenWinner: "CN Joventut", goalsHomeTeam: "10", goalsAwayTeam: "13" },
        { matchNumber: 13, chosenWinner: "CN Catalunya", goalsHomeTeam: "9", goalsAwayTeam: "8" },
        { matchNumber: 14, chosenWinner: "Boadilla", goalsHomeTeam: "17", goalsAwayTeam: "7" },
        { matchNumber: 15, chosenWinner: "UE Horta", goalsHomeTeam: "11", goalsAwayTeam: "16" },
      ],
    },
  },
  image3_quinipoloRanking: {
    matchday: "J16",
    rankingType: "quinipolo",
    participants: [
      { rank: 1, username: "TUKI4", points: 13, medal: "gold" },
      { rank: 2, username: "DGRANADOS03", points: 12, medal: "silver" },
      { rank: 2, username: "IGNASSI", points: 12, medal: "silver" },
      { rank: 3, username: "JANRU", points: 11, medal: "bronze" },
      { rank: 3, username: "CARLA.ALTI", points: 11, medal: "bronze" },
      { rank: 3, username: "NATASAR", points: 11, medal: "bronze" },
      { rank: 3, username: "ESTEAÑONOMEROBA", points: 11, medal: "bronze" },
      { rank: 3, username: "GABI.ACOSTA", points: 11, medal: "bronze" },
      { rank: 3, username: "XUISER", points: 11, medal: "bronze" },
      { rank: 3, username: "ARAPOLO", points: 11, medal: "bronze" },
    ],
  },
  image4_generalLeagueRanking: {
    matchday: "J16",
    rankingType: "general",
    leagueId: "351a1949-f6c5-4940-ac70-1c7dd08e8b1a",
    participantsLeaderboard: [
      { rank: 1, username: "JANRU", points: 163, totalPoints: 163, medal: "gold" },
      { rank: 2, username: "CARLA.ALTI", points: 162, totalPoints: 162, medal: "silver" },
      { rank: 3, username: "ESTEAÑONOMEROBA", points: 160, totalPoints: 160, medal: "bronze" },
      { rank: 3, username: "NATASAR", points: 160, totalPoints: 160, medal: "bronze" },
      { rank: 5, username: "GABI.ACOSTA", points: 158, totalPoints: 158, medal: null },
      { rank: 6, username: "YANYU95", points: 157, totalPoints: 157, medal: null },
      { rank: 6, username: "ALVARO", points: 157, totalPoints: 157, medal: null },
      { rank: 6, username: "YAGOBOF11", points: 157, totalPoints: 157, medal: null },
      { rank: 6, username: "ALAN ROJO", points: 157, totalPoints: 157, medal: null },
      { rank: 10, username: "TUKI4", points: 156, totalPoints: 156, medal: null },
    ],
  },
  image5_statistics: {
    matchday: "J16",
    averagePoints: 10.26,
    mostFailedMatch: {
      matchNumber: 4,
      homeTeam: "CN Atlètic-Barceloneta",
      awayTeam: "CN Sabadell",
      correctWinner: "CN Sabadell",
      mostWrongWinner: "CN Atlètic-Barceloneta",
      failedPercentage: 97.5,
      wrongCount: 39,
      totalCount: 40,
      correctGuessesCount: 1,
    },
  },
};

/** Special statistics image: J18, Puntuación media 10.83, Encinas vs Caballa with correct logo backgrounds */
const STATISTICS_SPECIAL_PAYLOAD = {
  _meta: { matchday: "J18" },
  image5_statistics: {
    matchday: "J18",
    averagePoints: 10.83,
    mostFailedMatch: {
      matchNumber: 14,
      homeTeam: "C. Las Encinas De Boadilla M",
      awayTeam: "CN Caballa Ceuta",
      correctWinner: "CN Caballa Ceuta",
      mostWrongWinner: "C. Las Encinas De Boadilla M",
      failedPercentage: 97.5,
      wrongCount: 39,
      totalCount: 40,
      correctGuessesCount: 0,
    },
  },
};

type LogoAudit = {
  resolved: Array<{
    teamName: string;
    logoFile: string;
    bgColor?: string | null;
    dimensions?: string | null;
  }>;
  missing: string[];
};

type GraphicsResponse = {
  matchday: string;
  images: Record<string, string>;
  logoAudit?: LogoAudit;
};

const GraphicsGeneratorPage = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const [logoAudit, setLogoAudit] = useState<LogoAudit | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (
    useAllTeamsMock = false,
    statisticsOnly = false
  ) => {
    setLoading(true);
    setError(null);
    setImages({});
    setLogoAudit(null);
    try {
      const payload = statisticsOnly
        ? STATISTICS_SPECIAL_PAYLOAD
        : useAllTeamsMock
          ? buildAllTeamsMockPayload()
          : MOCK_PAYLOAD;
      const res = await apiPost<GraphicsResponse>(
        "/api/graphics/generate",
        payload
      );
      setImages(res.images || {});
      setLogoAudit(res.logoAudit || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate graphics");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (key: string, dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `quinipolo-${key}-${Date.now()}.png`;
    link.click();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Graphics Generator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All 5 graphics: Match results (1 & 2), Ranking (3 & 4), Statistics (5)
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={() => handleGenerate(false)}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Generate with mock data"}
            </Button>
            <Button
              onClick={() => handleGenerate(true)}
              disabled={loading}
              title="Uses all teams from teamNameToImage to detect which logos need manual modification"
            >
              All-teams mock (templates 1 & 2)
            </Button>
            <Button
              onClick={() => handleGenerate(false, true)}
              disabled={loading}
              title="J18 special: Puntuación media 10.83, Encinas vs Caballa with correct logo backgrounds"
            >
              Statistics only (J18 special)
            </Button>
            <Button component={Link} to="/graphics/teams" size="small">
              Teams audit (CSV)
            </Button>
            <Button component={Link} to="/teams-curator" size="small">
              Teams Curator
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {logoAudit && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Logo audit ({logoAudit.resolved.length} resolved, {logoAudit.missing.length} missing)
              </Typography>
              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="caption" color="success.main" fontWeight="bold">
                    Resolved (team → logo file)
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, maxHeight: 200, overflow: "auto", fontSize: 12 }}>
                    {logoAudit.resolved.map(({ teamName, logoFile, bgColor, dimensions }) => (
                      <li key={teamName}>
                        <strong>{teamName}</strong> → {logoFile}
                        {(bgColor || dimensions) && (
                          <Typography component="span" variant="caption" display="block" color="text.secondary">
                            {[dimensions, bgColor].filter(Boolean).join(" · ")}
                          </Typography>
                        )}
                      </li>
                    ))}
                  </Box>
                </Box>
                {logoAudit.missing.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="error.main" fontWeight="bold">
                      Missing logos
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, maxHeight: 200, overflow: "auto", fontSize: 12 }}>
                      {logoAudit.missing.map((team) => (
                        <li key={team}>{team}</li>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {Object.entries(images).map(([key, dataUrl]) => (
              <Box key={key} sx={{ textAlign: "center" }}>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  {key}
                </Typography>
                <img
                  src={dataUrl}
                  alt={key}
                  style={{
                    maxWidth: 360,
                    maxHeight: 480,
                    border: "1px solid #ccc",
                    borderRadius: 8,
                  }}
                />
                <Button
                  size="small"
                  onClick={() => downloadImage(key, dataUrl)}
                  sx={{ mt: 1, display: "block", mx: "auto" }}
                >
                  Download
                </Button>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GraphicsGeneratorPage;
