import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import LeagueList from "./LeagueList";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../../Context/UserContext/UserContext", () => ({
  useUser: () => ({
    userData: {
      username: "me",
      role: "user",
      userId: "u1",
    },
  }),
}));

jest.mock("../../Context/FeedbackContext/FeedbackContext", () => ({
  useFeedback: () => ({ setFeedback: jest.fn() }),
}));

jest.mock("../../utils/apiUtils", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
}));

const { apiGet } = jest.requireMock("../../utils/apiUtils") as {
  apiGet: jest.Mock;
};

const leagues = [
  {
    id: "active-1",
    league_name: "Global 2026-2027",
    status: "active",
    is_private: false,
    participants: [{ user_id: "u1", username: "me", role: "user" }],
    participantPetitions: [],
    moderatorArray: [],
  },
  {
    id: "finished-1",
    league_name: "Global (2025-2026)",
    status: "finished",
    is_private: false,
    participants: [{ user_id: "u1", username: "me", role: "user" }],
    participantPetitions: [],
    moderatorArray: [],
  },
  {
    id: "inactive-1",
    league_name: "Paused Cup",
    status: "inactive",
    is_private: true,
    participants: [],
    participantPetitions: [],
    moderatorArray: [],
  },
  {
    id: "suspended-1",
    league_name: "Hold League",
    status: "suspended",
    is_private: false,
    participants: [],
    participantPetitions: [],
    moderatorArray: [],
  },
];

function renderList() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LeagueList />
    </I18nextProvider>
  );
}

describe("LeagueList status chips", () => {
  beforeEach(async () => {
    mockNavigate.mockReset();
    apiGet.mockResolvedValue(leagues);
    await i18n.changeLanguage("en");
  });

  it("shows a status chip for active, finished, inactive, and suspended leagues", async () => {
    renderList();

    expect(await screen.findByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toBeInTheDocument();
  });

  it("keeps GO enabled for a finished league the user already belongs to", async () => {
    renderList();
    await screen.findByText("Finished");

    const finishedRow = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Global (2025-2026)"));
    expect(finishedRow).toBeDefined();
    const goButton = within(finishedRow!).getByRole("button", {
      name: "Go to League",
    });
    expect(goButton).toHaveTextContent("Go");
    expect(goButton).toBeEnabled();

    await userEvent.click(goButton!);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/league-dashboard?id=finished-1"
      );
    });
  });

  it("lists every active league above finished and other inactive leagues", async () => {
    apiGet.mockResolvedValue([
      {
        id: "finished-big",
        league_name: "Old Global",
        status: "finished",
        is_private: false,
        participants: [
          { user_id: "u1", username: "me", role: "user" },
          { user_id: "u2", username: "other", role: "user" },
        ],
        participantPetitions: [],
        moderatorArray: [],
      },
      {
        id: "inactive-1",
        league_name: "Paused Cup",
        status: "inactive",
        is_private: true,
        participants: [],
        participantPetitions: [],
        moderatorArray: [],
      },
      {
        id: "active-open",
        league_name: "CNBeras",
        status: "active",
        is_private: false,
        participants: [],
        participantPetitions: [],
        moderatorArray: [],
      },
      {
        id: "suspended-1",
        league_name: "Hold League",
        status: "suspended",
        is_private: false,
        participants: [],
        participantPetitions: [],
        moderatorArray: [],
      },
      {
        id: "active-member",
        league_name: "Current Global",
        status: "active",
        is_private: false,
        participants: [{ user_id: "u1", username: "me", role: "user" }],
        participantPetitions: [],
        moderatorArray: [],
      },
    ]);

    renderList();
    await screen.findByText("CNBeras");

    const names = screen
      .getAllByRole("row")
      .slice(1)
      .map((row) => row.textContent ?? "");
    const indexOf = (name: string) => names.findIndex((text) => text.includes(name));

    expect(indexOf("Current Global")).toBeLessThan(indexOf("CNBeras"));
    expect(indexOf("CNBeras")).toBeLessThan(indexOf("Old Global"));
    expect(indexOf("CNBeras")).toBeLessThan(indexOf("Paused Cup"));
    expect(indexOf("CNBeras")).toBeLessThan(indexOf("Hold League"));
    expect(indexOf("Old Global")).toBeLessThan(indexOf("Paused Cup"));
    expect(indexOf("Paused Cup")).toBeLessThan(indexOf("Hold League"));
  });

  it("uses Spanish labels", async () => {
    await i18n.changeLanguage("es");
    renderList();

    expect(await screen.findByText("Activa")).toBeInTheDocument();
    expect(screen.getByText("Finalizada")).toBeInTheDocument();
    expect(screen.getByText("Inactiva")).toBeInTheDocument();
    expect(screen.getByText("Suspendida")).toBeInTheDocument();
  });
});
