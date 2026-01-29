/**
 * MatchForm Component Tests
 * 
 * These tests verify that team names don't disappear or flash when:
 * 1. Typing in the autocomplete input
 * 2. Selecting teams from dropdown
 * 3. Value prop updates from parent
 * 4. Rapid input changes
 * 
 * Note: Due to MUI component complexity in test environment, these tests serve as
 * documentation of expected behavior. Manual testing is recommended to verify fixes.
 */

import React from "react";
import { SurveyData } from "../../types/quinipolo";

// Mock all MUI components to avoid test environment issues
jest.mock("@mui/material", () => ({
  Autocomplete: ({ value, inputValue, onInputChange, onChange, ...props }: any) => (
    <div data-testid={`autocomplete-${props["data-testid"] || "default"}`}>
      <input
        data-testid={`input-${props["data-testid"] || "default"}`}
        value={inputValue || ""}
        onChange={(e) => onInputChange?.(null, e.target.value)}
        onBlur={() => onChange?.(null, value)}
      />
      {props.renderInput && props.renderInput({})}
    </div>
  ),
  FormControl: ({ children }: any) => <div>{children}</div>,
  InputLabel: ({ children }: any) => <label>{children}</label>,
  Select: ({ children, value, onChange, ...props }: any) => (
    <select value={value} onChange={onChange} {...props}>
      {children}
    </select>
  ),
  MenuItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  TextField: (props: any) => <input {...props} />,
  Typography: ({ children }: any) => <p>{children}</p>,
  Box: ({ children }: any) => <div>{children}</div>,
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

jest.mock("@mui/icons-material", () => ({}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@mui/material/styles", () => ({
  useTheme: () => ({
    palette: {
      mode: "light",
    },
  }),
}));

jest.mock("../../services/scraper/config", () => ({
  leagues: [
    { id: "DHM", name: "División de Honor Masculina" },
    { id: "DHF", name: "División de Honor Femenina" },
  ],
}));

// Import after mocks
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatchForm from "./MatchForm";

const mockTeamOptions = {
  waterpolo: [
    {
      name: "CN Barcelona",
      sport: "waterpolo" as const,
      gender: "m" as const,
      aliases: ["Barcelona", "CNB"],
    },
    {
      name: "CN Atlètic-Barceloneta",
      sport: "waterpolo" as const,
      gender: "m" as const,
      aliases: ["Barceloneta", "Atlétic"],
    },
    {
      name: "CN Sabadell",
      sport: "waterpolo" as const,
      gender: "f" as const,
      aliases: [],
    },
  ],
  football: [],
};

describe("MatchForm - Team Name Input Bug", () => {
  let mockSetQuinipolo: jest.Mock;
  let mockOnValidationChange: jest.Mock;

  beforeEach(() => {
    mockSetQuinipolo = jest.fn();
    mockOnValidationChange = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should maintain team name when typing in autocomplete", async () => {
    const initialValue: SurveyData = {
      gameType: "waterpolo",
      homeTeam: "",
      awayTeam: "",
      date: new Date(),
      isGame15: false,
    };

    render(
      <MatchForm
        teamOptions={mockTeamOptions}
        selectedTeams={[]}
        index={0}
        setQuinipolo={mockSetQuinipolo}
        loading={false}
        allowRepeatedTeams={false}
        onValidationChange={mockOnValidationChange}
        value={initialValue}
      />
    );

    const homeTeamInput = screen.getByLabelText(/homeTeam/i);
    
    // Type a team name
    await userEvent.type(homeTeamInput, "Barcelona");
    
    // Wait for state updates
    await waitFor(() => {
      expect(homeTeamInput).toHaveValue("Barcelona");
    });

    // Continue typing
    await userEvent.type(homeTeamInput, " CN");
    
    // The value should still be there, not disappear
    await waitFor(() => {
      expect(homeTeamInput).toHaveValue("Barcelona CN");
    }, { timeout: 2000 });
  });

  test("should not lose team name when value prop updates", async () => {
    const initialValue: SurveyData = {
      gameType: "waterpolo",
      homeTeam: "CN Barcelona",
      awayTeam: "",
      date: new Date(),
      isGame15: false,
    };

    const { rerender } = render(
      <MatchForm
        teamOptions={mockTeamOptions}
        selectedTeams={[]}
        index={0}
        setQuinipolo={mockSetQuinipolo}
        loading={false}
        allowRepeatedTeams={false}
        onValidationChange={mockOnValidationChange}
        value={initialValue}
      />
    );

    const homeTeamInput = screen.getByLabelText(/homeTeam/i);
    
    // Verify initial value is set
    expect(homeTeamInput).toHaveValue("CN Barcelona");

    // Simulate parent updating the value prop (e.g., from auto-fill)
    const updatedValue: SurveyData = {
      ...initialValue,
      awayTeam: "CN Atlètic-Barceloneta",
    };

    rerender(
      <MatchForm
        teamOptions={mockTeamOptions}
        selectedTeams={[]}
        index={0}
        setQuinipolo={mockSetQuinipolo}
        loading={false}
        allowRepeatedTeams={false}
        onValidationChange={mockOnValidationChange}
        value={updatedValue}
      />
    );

    // Home team should still be there
    await waitFor(() => {
      expect(homeTeamInput).toHaveValue("CN Barcelona");
    });
  });

  test("should handle rapid input changes without losing value", async () => {
    const initialValue: SurveyData = {
      gameType: "waterpolo",
      homeTeam: "",
      awayTeam: "",
      date: new Date(),
      isGame15: false,
    };

    render(
      <MatchForm
        teamOptions={mockTeamOptions}
        selectedTeams={[]}
        index={0}
        setQuinipolo={mockSetQuinipolo}
        loading={false}
        allowRepeatedTeams={false}
        onValidationChange={mockOnValidationChange}
        value={initialValue}
      />
    );

    const homeTeamInput = screen.getByLabelText(/homeTeam/i);
    
    // Rapid typing
    await userEvent.type(homeTeamInput, "CN", { delay: 10 });
    await userEvent.type(homeTeamInput, " Barcelona", { delay: 10 });
    
    // Value should persist
    await waitFor(() => {
      expect(homeTeamInput).toHaveValue("CN Barcelona");
    }, { timeout: 2000 });
  });

  test("should handle selecting team from dropdown without losing value", async () => {
    const initialValue: SurveyData = {
      gameType: "waterpolo",
      homeTeam: "",
      awayTeam: "",
      date: new Date(),
      isGame15: false,
    };

    render(
      <MatchForm
        teamOptions={mockTeamOptions}
        selectedTeams={[]}
        index={0}
        setQuinipolo={mockSetQuinipolo}
        loading={false}
        allowRepeatedTeams={false}
        onValidationChange={mockOnValidationChange}
        value={initialValue}
      />
    );

    const homeTeamInput = screen.getByLabelText(/homeTeam/i);
    
    // Type to open dropdown
    await userEvent.type(homeTeamInput, "Barcelona");
    
    // Wait for dropdown to appear
    await waitFor(() => {
      const option = screen.getByText(/CN Barcelona/i);
      expect(option).toBeInTheDocument();
    });

    // Click on the option
    const option = screen.getByText(/CN Barcelona/i);
    await userEvent.click(option);
    
    // Value should be set correctly
    await waitFor(() => {
      expect(homeTeamInput).toHaveValue("CN Barcelona");
    });
  });

  test("should handle alias selection correctly", async () => {
    const initialValue: SurveyData = {
      gameType: "waterpolo",
      homeTeam: "",
      awayTeam: "",
      date: new Date(),
      isGame15: false,
    };

    render(
      <MatchForm
        teamOptions={mockTeamOptions}
        selectedTeams={[]}
        index={0}
        setQuinipolo={mockSetQuinipolo}
        loading={false}
        allowRepeatedTeams={false}
        onValidationChange={mockOnValidationChange}
        value={initialValue}
      />
    );

    const homeTeamInput = screen.getByLabelText(/homeTeam/i);
    
    // Type an alias
    await userEvent.type(homeTeamInput, "Barceloneta");
    
    // Wait for dropdown with alias
    await waitFor(() => {
      const option = screen.getByText(/Barceloneta/i);
      expect(option).toBeInTheDocument();
    });

    // Click on alias option
    const aliasOption = screen.getByText(/Barceloneta/i);
    await userEvent.click(aliasOption);
    
    // Should convert to canonical name
    await waitFor(() => {
      expect(homeTeamInput).toHaveValue("CN Atlètic-Barceloneta");
    });
  });

  test("should not cause infinite update loops", async () => {
    const initialValue: SurveyData = {
      gameType: "waterpolo",
      homeTeam: "CN Barcelona",
      awayTeam: "",
      date: new Date(),
      isGame15: false,
    };

    render(
      <MatchForm
        teamOptions={mockTeamOptions}
        selectedTeams={[]}
        index={0}
        setQuinipolo={mockSetQuinipolo}
        loading={false}
        allowRepeatedTeams={false}
        onValidationChange={mockOnValidationChange}
        value={initialValue}
      />
    );

    // Wait a bit to see if there are excessive updates
    await waitFor(() => {
      // setQuinipolo should be called, but not excessively
      const callCount = mockSetQuinipolo.mock.calls.length;
      expect(callCount).toBeLessThan(10); // Should not be called more than 10 times
    }, { timeout: 1000 });
  });
});
