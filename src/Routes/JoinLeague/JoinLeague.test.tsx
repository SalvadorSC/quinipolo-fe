import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import JoinLeague from "./JoinLeague";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useParams: () => ({ shareToken: "invite-token" }),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../Context/UserContext/UserContext", () => ({
  useUser: () => ({
    userData: { userId: "u1", username: "me" },
  }),
}));

jest.mock("../../Context/FeedbackContext/FeedbackContext", () => ({
  useFeedback: () => ({ setFeedback: jest.fn() }),
}));

jest.mock("../../utils/apiUtils", () => ({
  apiPost: jest.fn(),
}));

const { apiPost } = jest.requireMock("../../utils/apiUtils") as {
  apiPost: jest.Mock;
};

function renderJoin() {
  return render(
    <I18nextProvider i18n={i18n}>
      <JoinLeague />
    </I18nextProvider>
  );
}

describe("JoinLeague share link", () => {
  beforeEach(async () => {
    mockNavigate.mockReset();
    apiPost.mockReset();
    localStorage.clear();
    await i18n.changeLanguage("en");
  });

  it("shows a finished-league message and does not open the league", async () => {
    apiPost.mockRejectedValue({
      response: {
        status: 409,
        data: {
          code: "LEAGUE_FINISHED",
          league_status: "finished",
          error: "Esta liga está finalizada y no admite nuevos quinipolos.",
        },
      },
    });

    renderJoin();

    expect(
      await screen.findByText("This league is finished, so you cannot join it.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Successfully Joined League")).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith(
      expect.stringContaining("/league-dashboard")
    );
  });

  it("still joins when the share link is for an open league", async () => {
    apiPost.mockResolvedValue({
      league: { id: "active-1", league_name: "CNBeras" },
    });

    renderJoin();

    expect(await screen.findByText("CNBeras")).toBeInTheDocument();
    expect(apiPost).toHaveBeenCalledWith(
      "/api/leagues/join-by-link/invite-token",
      { userId: "u1", username: "me" }
    );
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "/league-dashboard?id=active-1"
        );
      },
      { timeout: 3000 }
    );
  });
});
