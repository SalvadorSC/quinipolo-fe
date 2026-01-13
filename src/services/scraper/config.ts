import { LeagueConfig } from "./types";

export const leagues: LeagueConfig[] = [
  {
    id: "DHM",
    name: "División de Honor Masculina",
    quota: 4,
    primarySource: "flashscore",
    flashscoreUrl:
      "https://www.flashscore.es/waterpolo/espana/division-de-honor/",
    rfenCompetitionId: 1510,
  },
  {
    id: "DHF",
    name: "División de Honor Femenina",
    quota: 4,
    primarySource: "flashscore",
    flashscoreUrl:
      "https://www.flashscore.es/waterpolo/espana/division-de-honor-femenina/",
    rfenCompetitionId: 1511,
  },
  {
    id: "PDM",
    name: "Primera División Masculina",
    quota: 3,
    primarySource: "flashscore",
    flashscoreUrl:
      "https://www.flashscore.es/waterpolo/espana/primera-division/",
    rfenCompetitionId: 1512,
  },
  {
    id: "PDF",
    name: "Primera División Femenina",
    quota: 3,
    primarySource: "flashscore",
    flashscoreUrl:
      "https://www.flashscore.es/waterpolo/espana/primera-division-femenina/",
    rfenCompetitionId: 1513,
  },
  {
    id: "SDM",
    name: "Segunda División Masculina",
    quota: 1,
    primarySource: "flashscore",
    flashscoreUrl:
      "https://www.flashscore.es/waterpolo/espana/segunda-division/",
    rfenCompetitionId: 1514,
  },
  {
    id: "CL",
    name: "Champions League",
    quota: 0,
    primarySource: "flashscore",
    flashscoreUrl:
      "https://www.flashscore.es/waterpolo/europa/champions-league/",
  },
  {
    id: "CLF",
    name: "Champions League (Women)",
    quota: 0,
    primarySource: "flashscore",
    flashscoreUrl:
      "https://www.flashscore.es/waterpolo/europa/champions-league-women/",
  },
  {
    id: "SEL. M",
    name: "Selección Masculina",
    quota: 0,
    primarySource: "flashscore",
  },
  {
    id: "SEL. F",
    name: "Selección Femenina",
    quota: 0,
    primarySource: "flashscore",
  },
];
