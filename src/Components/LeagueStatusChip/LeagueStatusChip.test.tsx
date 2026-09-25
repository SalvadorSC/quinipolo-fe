import React from "react";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import { LeagueStatusChip } from "./LeagueStatusChip";

function renderChip(
  status: string | null | undefined,
  props: Partial<React.ComponentProps<typeof LeagueStatusChip>> = {}
) {
  return render(
    <I18nextProvider i18n={i18n}>
      <LeagueStatusChip status={status} {...props} />
    </I18nextProvider>
  );
}

describe("LeagueStatusChip", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it.each([
    ["active", "Active"],
    ["finished", "Finished"],
    ["inactive", "Inactive"],
    ["suspended", "Suspended"],
  ])("renders a %s badge", (status, label) => {
    renderChip(status);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("keeps inherit contrast readable and still shows the status", () => {
    renderChip("finished", {
      contrast: "inherit",
      sx: { ml: "auto" },
    });

    const chip = screen.getByText("Finished");
    expect(chip).toBeInTheDocument();
    expect(chip.closest(".MuiChip-root")).toHaveStyle({
      marginLeft: "auto",
      color: "inherit",
    });
  });

  it("renders nothing for a missing or unknown status", () => {
    const { container, rerender } = renderChip(null);
    expect(container).toBeEmptyDOMElement();

    rerender(
      <I18nextProvider i18n={i18n}>
        <LeagueStatusChip status="archived" />
      </I18nextProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
