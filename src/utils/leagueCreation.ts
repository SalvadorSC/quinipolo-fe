import { apiPost } from "./apiUtils";

export interface CreateLeagueParams {
  leagueName: string;
  isPrivate: boolean;
  tier: string;
  userId: string;
  description?: string;
  icon?: string;
  accentColor?: string;
  iconStyle?: {
    icon?: string;
    accent_color?: string;
    icon_color?: string;
  };
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
    icon: params.icon,
    accentColor: params.accentColor,
    iconStyle: params.iconStyle,
  };

  return await apiPost<CreatedLeagueResponse>("/api/leagues", payload);
};
