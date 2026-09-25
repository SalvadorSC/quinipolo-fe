import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import {
  compareLeaguesActiveFirst,
  getLeagueLifecycleStatus,
  getLeagueStatusChipColor,
  getLeagueStatusLabelKey,
  isFinishedLeagueApiError,
  isLeagueFinished,
} from "./leagueStatus";

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

describe("getLeagueLifecycleStatus", () => {
  it("recognizes every stored league status, ignoring case and whitespace", () => {
    expect(getLeagueLifecycleStatus({ status: "active" })).toBe("active");
    expect(getLeagueLifecycleStatus({ status: " Active " })).toBe("active");
    expect(getLeagueLifecycleStatus({ status: "inactive" })).toBe("inactive");
    expect(getLeagueLifecycleStatus({ status: "SUSPENDED" })).toBe("suspended");
    expect(getLeagueLifecycleStatus({ status: "finished" })).toBe("finished");
  });

  it("returns null when status is missing or unknown", () => {
    expect(getLeagueLifecycleStatus({ status: "" })).toBeNull();
    expect(getLeagueLifecycleStatus({ status: "archived" })).toBeNull();
    expect(getLeagueLifecycleStatus({})).toBeNull();
    expect(getLeagueLifecycleStatus(null)).toBeNull();
  });

  it("maps each status to an existing label key and chip color", () => {
    expect(getLeagueStatusLabelKey("active")).toBe("leagueActive");
    expect(getLeagueStatusLabelKey("inactive")).toBe("leagueInactive");
    expect(getLeagueStatusLabelKey("suspended")).toBe("leagueSuspended");
    expect(getLeagueStatusLabelKey("finished")).toBe("leagueFinished");

    expect(getLeagueStatusChipColor("active")).toBe("success");
    expect(getLeagueStatusChipColor("inactive")).toBe("default");
    expect(getLeagueStatusChipColor("suspended")).toBe("warning");
    expect(getLeagueStatusChipColor("finished")).toBe("default");
  });

  it("has Active / Activa and Finished / Finalizada copy", () => {
    expect(en.leagueActive).toBe("Active");
    expect(en.leagueInactive).toBe("Inactive");
    expect(en.leagueSuspended).toBe("Suspended");
    expect(en.leagueFinished).toBe("Finished");

    expect(es.leagueActive).toBe("Activa");
    expect(es.leagueInactive).toBe("Inactiva");
    expect(es.leagueSuspended).toBe("Suspendida");
    expect(es.leagueFinished).toBe("Finalizada");
  });
});

describe("compareLeaguesActiveFirst", () => {
  it("places active before finished, inactive, suspended, and unknown", () => {
    const active = { status: "active" };
    expect(compareLeaguesActiveFirst(active, { status: "finished" })).toBeLessThan(
      0
    );
    expect(compareLeaguesActiveFirst(active, { status: "inactive" })).toBeLessThan(
      0
    );
    expect(
      compareLeaguesActiveFirst(active, { status: "suspended" })
    ).toBeLessThan(0);
    expect(compareLeaguesActiveFirst(active, { status: "archived" })).toBeLessThan(
      0
    );
    expect(compareLeaguesActiveFirst(active, {})).toBeLessThan(0);
    expect(compareLeaguesActiveFirst({ status: " Active " }, active)).toBe(0);
  });

  it("does not order non-active statuses against each other", () => {
    expect(
      compareLeaguesActiveFirst({ status: "finished" }, { status: "inactive" })
    ).toBe(0);
    expect(
      compareLeaguesActiveFirst({ status: "suspended" }, { status: "finished" })
    ).toBe(0);
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
