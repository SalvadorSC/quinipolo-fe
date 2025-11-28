import { useState, useEffect } from "react";
import { apiGet } from "../../../utils/apiUtils";
import { AnswerStatistics } from "../../../types/quinipolo";

interface AnswerStatisticsResponse {
  quinipolo_id: string;
  statistics: AnswerStatistics;
  computed_at: string;
  total_responses: number;
}

export const useAnswerStatistics = (
  quinipoloId: string | undefined,
  endDate: string | undefined,
  shouldShowStatistics: boolean
) => {
  const [statistics, setStatistics] = useState<AnswerStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if:
    // 1. We have a quinipolo ID
    // 2. Deadline has passed
    // 3. We're in a mode where statistics should be shown
    if (!quinipoloId || !endDate || !shouldShowStatistics) {
      setStatistics(null);
      return;
    }

    const deadlinePassed = new Date(endDate) < new Date();
    if (!deadlinePassed) {
      setStatistics(null);
      return;
    }

    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGet<AnswerStatisticsResponse | null>(
          `/api/answer-statistics/quinipolo/${quinipoloId}`
        );

        if (response && response.statistics) {
          setStatistics(response.statistics);
        } else {
          setStatistics(null);
        }
      } catch (err: any) {
        console.error("Error fetching answer statistics:", err);
        setError(err.message || "Failed to fetch statistics");
        setStatistics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [quinipoloId, endDate, shouldShowStatistics]);

  return {
    statistics,
    loading,
    error,
  };
};

