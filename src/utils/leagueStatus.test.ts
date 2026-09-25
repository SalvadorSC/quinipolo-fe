import { isFinishedLeagueApiError, isLeagueFinished } from "./leagueStatus";

describe("isLeagueFinished", () => {
  it("is true only when status is finished", () => {
    expect(isLeagueFinished({ status: "finished" })).toBe(true);
    expect(isLeagueFinished({ status: " Finished " })).toBe(true);
    expect(isLeagueFinished({ status: "FINISHED" })).toBe(true);
  });

  it("does not treat active leagues such as CNBeras as finished", () => {
    expect(
      isLeagueFinished({ status: "active" })
    ).toBe(false);
    expect(isLeagueFinished({ status: "inactive" })).toBe(false);
    expect(isLeagueFinished({ status: "suspended" })).toBe(false);
    expect(isLeagueFinished({ status: "" })).toBe(false);
    expect(isLeagueFinished({})).toBe(false);
    expect(isLeagueFinished(null)).toBe(false);
    expect(isLeagueFinished(undefined)).toBe(false);
  });
});

describe("isFinishedLeagueApiError", () => {
  it("detects an explicit finished-league code or status", () => {
    expect(
      isFinishedLeagueApiError({
        response: { status: 403, data: { code: "LEAGUE_FINISHED" } },
      })
    ).toBe(true);
    expect(
      isFinishedLeagueApiError({
        response: { status: 409, data: { leagueStatus: "finished" } },
      })
    ).toBe(true);
  });

  it("detects a league-finished message without treating unrelated errors as finished", () => {
    expect(
      isFinishedLeagueApiError({
        response: {
          status: 400,
          data: { error: "Cannot create quinipolo: league is finished" },
        },
      })
    ).toBe(true);
    expect(
      isFinishedLeagueApiError({
        response: {
          status: 403,
          data: { error: "Insufficient permissions" },
        },
      })
    ).toBe(false);
    expect(
      isFinishedLeagueApiError({
        response: { status: 401, data: { error: "Authentication required" } },
      })
    ).toBe(false);
  });
});
