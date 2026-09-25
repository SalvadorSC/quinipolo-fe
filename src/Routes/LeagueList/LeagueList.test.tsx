import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import LeagueList from "./LeagueList";

const mockNavigate = jest.fn();
const mockSetFeedback = jest.fn();

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
  useFeedback: () => ({ setFeedback: mockSetFeedback }),
}));

jest.mock("../../utils/apiUtils", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
}));

const { apiGet, apiPost, apiPut } = jest.requireMock("../../utils/apiUtils") as {
  apiGet: jest.Mock;
  apiPost: jest.Mock;
  apiPut: jest.Mock;
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
    mockSetFeedback.mockReset();
    apiGet.mockResolvedValue(leagues);
    apiPut.mockResolvedValue({});
    apiPost.mockResolvedValue([]);
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

  it("does not join a finished league and still joins an active league", async () => {
    apiGet.mockResolvedValue([
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
        id: "finished-closed",
        league_name: "Old Cup",
        status: "finished",
        is_private: false,
        participants: [],
        participantPetitions: [],
        moderatorArray: [],
      },
      {
        id: "finished-private",
        league_name: "Old Private",
        status: "finished",
        is_private: true,
        participants: [],
        participantPetitions: [],
        moderatorArray: [],
      },
    ]);

    renderList();
    await screen.findByText("CNBeras");

    const blockedButtons = screen.getAllByRole("button", {
      name: "This league is finished, so you cannot join it.",
    });
    expect(blockedButtons).toHaveLength(2);
    blockedButtons.forEach((button) => expect(button).toBeDisabled());
    expect(apiPut).not.toHaveBeenCalled();
    expect(apiPost).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "Join League" })
    );
    await waitFor(() => {
      expect(apiPut).toHaveBeenCalledWith("/api/leagues/active-open/join", {
        leagueId: "active-open",
        username: "me",
      });
    });
    expect(apiPost).not.toHaveBeenCalled();
  });

  it("orders columns as name, actions, participants, then a lock or globe", async () => {
    renderList();
    await screen.findByText("Global 2026-2027");

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveTextContent("Name");
    expect(within(headers[1]).getByTestId("MoreHorizIcon")).toBeInTheDocument();
    expect(within(headers[2]).getByTestId("EmojiPeopleIcon")).toBeInTheDocument();
    expect(within(headers[3]).getByTestId("LockIcon")).toBeInTheDocument();

    const publicRow = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Global 2026-2027"));
    const publicCells = within(publicRow!).getAllByRole("cell");
    expect(within(publicRow!).getByRole("rowheader")).toHaveTextContent(
      "Active"
    );
    expect(
      within(publicCells[0]).getByRole("button", { name: "Go to League" })
    ).toBeInTheDocument();
    expect(publicCells[1]).toHaveTextContent("1");
    expect(within(publicCells[2]).getByLabelText("Public")).toBeInTheDocument();
    expect(publicCells[2]).not.toHaveTextContent("Public");

    const privateRow = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Paused Cup"));
    const privateCells = within(privateRow!).getAllByRole("cell");
    expect(within(privateRow!).getByRole("rowheader")).toHaveTextContent(
      "Inactive"
    );
    expect(within(privateCells[2]).getByLabelText("Private")).toBeInTheDocument();
    expect(privateCells[2]).not.toHaveTextContent("Private");

    const finishedRow = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Global (2025-2026)"));
    expect(within(finishedRow!).getByRole("rowheader")).toHaveTextContent(
      "Finished"
    );
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
