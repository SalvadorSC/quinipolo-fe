import { apiPost } from "./apiUtils";

export interface CreateLeagueParams {
  leagueName: string;
  isPrivate: boolean;
  tier: string;
  userId: string;
  description?: string;
}

export interface CreatedLeagueResponse {
  id: string;
}

export const createLeagueInDev = async (
  params: CreateLeagueParams
): Promise<CreatedLeagueResponse> => {
  const payload = {
    leagueName: params.leagueName.trim(),
    isPrivate: params.isPrivate,
    tier: params.tier,
    userId: params.userId,
    description: (params.description || "").trim(),
  };

  return await apiPost<CreatedLeagueResponse>("/api/leagues", payload);
};
