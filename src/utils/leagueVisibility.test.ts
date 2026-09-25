import { filterVisibleLeagues } from "./leagueVisibility";

describe("filterVisibleLeagues", () => {
  it("keeps finished leagues and active leagues such as CNBeras visible", () => {
    const leagues = [
      {
        id: "global-old",
        league_name: "Global",
        is_private: false,
        status: "finished",
      },
      {
        id: "cnberas",
        league_name: "CNBeras",
        is_private: false,
        status: "active",
      },
      {
        id: "test",
        league_name: "Test",
        is_private: false,
        status: "active",
      },
    ];

    expect(filterVisibleLeagues(leagues, "user").map((l) => l.league_name)).toEqual([
      "Global",
      "CNBeras",
    ]);
    expect(
      filterVisibleLeagues(leagues, "system_moderator").map((l) => l.league_name)
    ).toEqual(["Global", "CNBeras", "Test"]);
  });
});
