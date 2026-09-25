import React from "react";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import Dashboard from "./Dashboard";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("../../Components/QuinipolosToAnswer/QuinipolosToAnswer", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../Context/UserContext/UserContext", () => {
  const leagues = ["finished-1", "inactive-1", "active-1"];
  return {
    useUser: () => ({
      userData: {
        role: "user",
        username: "me",
        isAuthenticated: true,
        // Profile order is finished first. The dashboard must reorder it.
        leagues,
      },
      updateUser: jest.fn(),
    }),
  };
});

jest.mock("../../utils/apiUtils", () => ({
  apiGet: jest.fn(),
}));

const { apiGet } = jest.requireMock("../../utils/apiUtils") as {
  apiGet: jest.Mock;
};

const leaguesById: Record<string, { id: string; league_name: string; status: string }> =
  {
    "finished-1": {
      id: "finished-1",
      league_name: "Old Global",
      status: "finished",
    },
    "inactive-1": {
      id: "inactive-1",
      league_name: "Paused Cup",
      status: "inactive",
    },
    "active-1": {
      id: "active-1",
      league_name: "Current Global",
      status: "active",
    },
  };

function renderDashboard() {
  return render(
    <I18nextProvider i18n={i18n}>
      <Dashboard />
    </I18nextProvider>
  );
}

describe("Dashboard my leagues", () => {
  beforeEach(async () => {
    apiGet.mockImplementation((url: string) => {
      const id = url.split("/").pop() ?? "";
      return Promise.resolve({
        ...leaguesById[id],
        participants: [],
        icon_style: {},
      });
    });
    await i18n.changeLanguage("en");
  });

  it("lists active leagues before finished ones and chips only finished leagues", async () => {
    renderDashboard();

    expect(await screen.findByText("Current Global")).toBeInTheDocument();

    const names = ["Current Global", "Old Global", "Paused Cup"];
    const indexes = names.map((name) =>
      screen.getAllByRole("button").findIndex((button) =>
        button.textContent?.includes(name)
      )
    );
    expect(indexes[0]).toBeGreaterThanOrEqual(0);
    expect(indexes[0]).toBeLessThan(indexes[1]);
    expect(indexes[0]).toBeLessThan(indexes[2]);

    expect(screen.getByText("Finished")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();

    const activeButton = screen.getByRole("button", { name: /Current Global/ });
    const finishedButton = screen.getByRole("button", { name: /Old Global/ });
    expect(activeButton).not.toHaveTextContent("Active");
    expect(finishedButton).toHaveTextContent("Finished");
  });

  it("uses Finalizada on the dashboard and still hides Activa", async () => {
    await i18n.changeLanguage("es");
    renderDashboard();

    expect(await screen.findByText("Finalizada")).toBeInTheDocument();
    expect(screen.queryByText("Activa")).not.toBeInTheDocument();
  });
});
