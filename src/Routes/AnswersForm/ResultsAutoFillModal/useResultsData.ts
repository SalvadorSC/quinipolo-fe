import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchQuinipoloResults } from "../../../services/scraper/scraperService";
import type { MatchResult } from "../../../services/scraper/types";
import type { LeagueWithCount } from "./types";
import {
  CONFIDENCE_THRESHOLD_HIGH,
  CONFIDENCE_THRESHOLD_LOW,
} from "./constants";

export function useResultsData(open: boolean, quinipoloId: string) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MatchResult[] | null>(null);
  const [selectedMatchNumbers, setSelectedMatchNumbers] = useState<Set<number>>(
    new Set()
  );
  const [selectedLeagues, setSelectedLeagues] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!open || !quinipoloId) {
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedMatchNumbers(new Set());
    setSelectedLeagues(new Set());

    fetchQuinipoloResults(quinipoloId, 7)
      .then((response) => {
        const matches = response.matches || [];
        setData(matches);

        const availableLeagues = new Set(matches.map((m) => m.leagueId));
        setSelectedLeagues(availableLeagues);

        const highConfidenceMatches = matches.filter(
          (match) => match.confidence >= CONFIDENCE_THRESHOLD_HIGH
        );
        setSelectedMatchNumbers(
          new Set(highConfidenceMatches.map((m) => m.matchNumber))
        );
      })
      .catch((err) => {
        console.error(err);
        setError(
          err?.message ??
            t("resultsAutoFill.fetchError") ??
            "Unable to fetch results. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, quinipoloId, t]);

  const lowConfidenceMatches = useMemo(() => {
    if (!data) return [];
    return data.filter((match) => match.confidence < CONFIDENCE_THRESHOLD_LOW);
  }, [data]);

  const nonHighConfidenceMatches = useMemo(() => {
    if (!data) return [];
    return data.filter((match) => match.confidence < CONFIDENCE_THRESHOLD_HIGH);
  }, [data]);

  const selectedMatches = useMemo(() => {
    if (!data) return [];
    return data.filter((match) => selectedMatchNumbers.has(match.matchNumber));
  }, [data, selectedMatchNumbers]);

  const leaguesWithCounts = useMemo((): LeagueWithCount[] => {
    if (!data) return [];
    const leagueMap = new Map<string, LeagueWithCount>();

    data.forEach((match) => {
      const existing = leagueMap.get(match.leagueId);
      if (existing) {
        existing.count += 1;
      } else {
        leagueMap.set(match.leagueId, {
          id: match.leagueId,
          name: match.leagueName,
          count: 1,
        });
      }
    });

    return Array.from(leagueMap.values()).sort((a, b) =>
      a.id.localeCompare(b.id)
    );
  }, [data]);

  const displayedMatches = useMemo(() => {
    if (!data) return [];
    if (selectedLeagues.size === 0) return data;
    return data.filter((match) => selectedLeagues.has(match.leagueId));
  }, [data, selectedLeagues]);

  return {
    loading,
    error,
    data,
    selectedMatchNumbers,
    setSelectedMatchNumbers,
    selectedLeagues,
    setSelectedLeagues,
    lowConfidenceMatches,
    nonHighConfidenceMatches,
    selectedMatches,
    leaguesWithCounts,
    displayedMatches,
  };
}

