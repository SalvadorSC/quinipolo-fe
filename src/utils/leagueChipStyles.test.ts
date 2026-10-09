import {
  defaultLeagueChipStyle,
  getLeagueChipStyle,
  leagueChipStyles,
} from "./leagueChipStyles";

describe("getLeagueChipStyle", () => {
  it("gives CLF a gold chip in the same family as CL", () => {
    const clf = getLeagueChipStyle("CLF");

    expect(clf).toEqual(leagueChipStyles.CLF);
    expect(clf).not.toEqual(defaultLeagueChipStyle);
    expect(clf.color).toBe(leagueChipStyles.CL.color);
    expect(clf.background).toContain("#f9a825");
    expect(clf.background).toContain("#ffe082");
  });

  it("keeps a dedicated color for PDM, PDF and SDM", () => {
    for (const leagueId of ["PDM", "PDF", "SDM"] as const) {
      expect(getLeagueChipStyle(leagueId)).toEqual(leagueChipStyles[leagueId]);
      expect(getLeagueChipStyle(leagueId)).not.toEqual(defaultLeagueChipStyle);
    }
  });
});
