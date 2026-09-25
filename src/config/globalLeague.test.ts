import {
  adjustLegacyGlobalDisplayMatchday,
  isLegacyGlobalLeague,
  LEGACY_GLOBAL_LEAGUE_ID,
} from "./globalLeague";
import {
  DEFAULT_LEAGUES_WITH_IMAGE_SHARE_BETA,
  resolveLeaguesWithImageShareBeta,
} from "./leaguesWithImageShare";

const NEW_GLOBAL_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const CNBERAS_ID = "11111111-2222-3333-4444-555555555555";

describe("legacy Global matchday offset", () => {
  it("subtracts 2 only for the 2025-26 Global league when matchday is not already set", () => {
    expect(
      adjustLegacyGlobalDisplayMatchday(LEGACY_GLOBAL_LEAGUE_ID, 16, false)
    ).toBe(14);
    expect(adjustLegacyGlobalDisplayMatchday("global", 5, false)).toBe(3);
    expect(adjustLegacyGlobalDisplayMatchday(LEGACY_GLOBAL_LEAGUE_ID, 1, false)).toBe(
      1
    );
  });

  it("does not double-apply the offset and does not apply it to a new Global season or other leagues", () => {
    expect(
      adjustLegacyGlobalDisplayMatchday(LEGACY_GLOBAL_LEAGUE_ID, 14, true)
    ).toBe(14);
    expect(adjustLegacyGlobalDisplayMatchday(NEW_GLOBAL_ID, 16, false)).toBe(16);
    expect(adjustLegacyGlobalDisplayMatchday(CNBERAS_ID, 10, false)).toBe(10);
    expect(adjustLegacyGlobalDisplayMatchday(undefined, undefined, false)).toBe(
      undefined
    );
    expect(isLegacyGlobalLeague(NEW_GLOBAL_ID)).toBe(false);
    expect(isLegacyGlobalLeague(CNBERAS_ID)).toBe(false);
    expect(isLegacyGlobalLeague(LEGACY_GLOBAL_LEAGUE_ID)).toBe(true);
  });
});

describe("image share league ids", () => {
  it("keeps the legacy Global UUID and appends the active 2026-27 id", () => {
    expect(DEFAULT_LEAGUES_WITH_IMAGE_SHARE_BETA).toContain(
      LEGACY_GLOBAL_LEAGUE_ID
    );
    const ids = resolveLeaguesWithImageShareBeta({
      activeGlobalLeagueId: NEW_GLOBAL_ID,
    });
    expect(ids[0]).toBe(LEGACY_GLOBAL_LEAGUE_ID);
    expect(ids[1]).toBe(NEW_GLOBAL_ID);
  });

  it("does not duplicate an id that is already configured", () => {
    const ids = resolveLeaguesWithImageShareBeta({
      envList: `${NEW_GLOBAL_ID}, ${LEGACY_GLOBAL_LEAGUE_ID}`,
      activeGlobalLeagueId: NEW_GLOBAL_ID,
    });
    expect(ids.filter((id) => id === NEW_GLOBAL_ID)).toHaveLength(1);
    expect(ids).toContain(LEGACY_GLOBAL_LEAGUE_ID);
  });
});
