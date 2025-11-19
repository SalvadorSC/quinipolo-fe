// Quinipolo Types - Frontend
export interface SurveyData {
  gameType: "waterpolo" | "football";
  homeTeam: string;
  awayTeam: string;
  date: Date | null;
  isGame15: boolean;
}

export interface TeamOption {
  name: string;
  sport: "waterpolo" | "football";
  gender: "m" | "f" | null;
  aliases?: string[];
}

export type TeamOptionsBySport = {
  waterpolo: TeamOption[];
  football: TeamOption[];
};

export interface CorrectAnswer {
  matchNumber: number;
  chosenWinner: string;
  goalsHomeTeam: string;
  goalsAwayTeam: string;
  isGame15: boolean;
}

// Supabase Quinipolo structure (what comes from the database)
export interface SupabaseQuinipolo {
  id: string;
  league_id: string;
  quinipolo: SurveyData[];
  end_date: string;
  has_been_corrected: boolean;
  creation_date: string;
  is_deleted: boolean;
  participants_who_answered?: string[];
  correct_answers?: CorrectAnswer[];
  answered?: boolean; // Added by getQuinipolosToAnswer
}

// Frontend Quinipolo structure (what the frontend expects)
export interface QuinipoloType {
  id: string;
  league_id: string;
  league_name: string; // This is the key field that was missing!
  quinipolo: SurveyData[];
  end_date: string;
  has_been_corrected: boolean;
  creation_date: string;
  is_deleted: boolean;
  participants_who_answered?: string[];
  correct_answers?: CorrectAnswer[];
  answered?: boolean;
}

// API Response types
export interface QuinipoloCreateResponseType {
  id: string;
  league_name: string;
  league_id: string;
  quinipolo: SurveyData[];
  end_date: string;
  has_been_corrected: boolean;
  creation_date: string;
}

// Component Props
export interface QuinipoloCardProps {
  quinipolo: QuinipoloType;
  deadlineIsInPast: boolean;
  username: string;
  userLeagues: Array<{ league_id: string; role: string }>;
}

export interface QuinipolosToAnswerProps {
  leagueId?: string;
  wrapperLoading?: boolean;
  appLocation?: "league-dashboard" | "user-dashboard";
}

export interface TabPanelContentProps {
  quinipolos: QuinipoloType[];
  username: string;
  userLeagues: Array<{ league_id: string; role: string }>;
  fallBackText?: string;
}
