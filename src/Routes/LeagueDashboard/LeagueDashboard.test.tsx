import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import LeagueDashboard from "./LeagueDashboard";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("../../Components/QuinipolosToAnswer/QuinipolosToAnswer", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../Context/UserContext/UserContext", () => ({
  useUser: () => ({
    userData: {
      username: "me",
      userId: "u1",
      role: "user",
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

const finishedLeague = {
  id: "finished-1",
  league_name: "Global (2025-2026)",
  status: "finished",
  is_private: false,
  participants: [],
  participantPetitions: [],
  moderatorPetitions: [],
  moderatorArray: [],
  quinipolosToAnswer: [],
  leaguesToCorrect: [],
};

function renderDashboard() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LeagueDashboard />
    </I18nextProvider>
  );
}

describe("League detail finished header", () => {
  beforeEach(async () => {
    window.history.pushState({}, "", "/league-dashboard?id=finished-1");
    apiGet.mockImplementation((url: string) => {
      if (String(url).includes("leaderboard")) {
        return Promise.resolve({ participantsLeaderboard: [] });
      }
      return Promise.resolve(finishedLeague);
    });
    await i18n.changeLanguage("en");
  });

  it("keeps the finished banner and does not put a Finished chip beside the title", async () => {
    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: "Global (2025-2026)" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This league is finished. You can still view quinipolos, rankings, and records, but new Quinipolos cannot be created."
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Finished")).not.toBeInTheDocument();

    const [headerInfoIcon] = screen.getAllByTestId("InfoOutlinedIcon");
    await userEvent.click(headerInfoIcon);
    expect(await screen.findByText("League Information")).toBeInTheDocument();
    expect(screen.queryByText("Finished")).not.toBeInTheDocument();
  });
});
