import type { MatchResult } from "../../../services/scraper/types";

export interface ResultsAutoFillModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (matches: MatchResult[]) => void;
  quinipoloId: string;
}

export interface LeagueWithCount {
  id: string;
  name: string;
  count: number;
}

