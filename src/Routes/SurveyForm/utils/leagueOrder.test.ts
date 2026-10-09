import type { SurveyData } from "../../../types/quinipolo";
import {
  LEAGUE_ORDER,
  getLeagueSortIndex,
  sortMatchesByLeague,
} from "./leagueOrder";

const match = (leagueId: string, homeTeam = leagueId): SurveyData => ({
  gameType: "waterpolo",
  homeTeam,
  awayTeam: "Away",
  date: new Date("2026-10-10T12:00:00Z"),
  isGame15: false,
  leagueId,
});

describe("getLeagueSortIndex", () => {
  it("orders Champions League, then Spanish divisions, then national teams", () => {
    const ordered = [...LEAGUE_ORDER].sort(
      (a, b) => getLeagueSortIndex(a) - getLeagueSortIndex(b)
    );

    expect(ordered).toEqual([
      "CL",
      "CLF",
      "DHM",
      "DHF",
      "PDM",
      "PDF",
      "SDM",
      "SEL. M",
      "SEL. F",
    ]);
  });

  it("places an unknown league after every known league", () => {
    expect(getLeagueSortIndex("CLF")).toBeLessThan(getLeagueSortIndex("ZZZ"));
    expect(getLeagueSortIndex("PDM")).toBeLessThan(getLeagueSortIndex(""));
    expect(getLeagueSortIndex(null)).toBe(LEAGUE_ORDER.length);
  });
});

describe("sortMatchesByLeague", () => {
  it("sorts the first 14 matches and keeps the pleno at the end", () => {
    const matches = [
      match("PDF"),
      match("CLF"),
      match("SDM"),
      match("DHM"),
      match("PDM"),
      match("CL"),
      match("DHF"),
      match("SEL. F"),
      match("SEL. M"),
      ...Array.from({ length: 5 }, (_, index) =>
        match("DHM", `filler-${index}`)
      ),
      match("PDF", "pleno"),
    ];

    const sorted = sortMatchesByLeague(matches);

    expect(sorted).toHaveLength(15);
    expect(sorted.slice(0, 9).map((item) => item.leagueId)).toEqual([
      "CL",
      "CLF",
      "DHM",
      "DHM",
      "DHM",
      "DHM",
      "DHM",
      "DHM",
      "DHF",
    ]);
    expect(sorted[14].homeTeam).toBe("pleno");
  });
});
