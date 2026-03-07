import React, { useState } from "react";
import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { apiGet } from "../../utils/apiUtils";

type MissingEntry = { teamName: string; closestMatch?: string };

type LogoAudit = {
  resolved: Array<{
    teamName: string;
    logoFile: string;
    bgColor?: string | null;
    dimensions?: string | null;
  }>;
  missing: (string | MissingEntry)[];
};

type MatchPair = { homeTeam: string; awayTeam: string };

type LogosPerImage = Record<string, string[]>;

type TeamsGraphicsResponse = {
  images: Record<string, string>;
  imageMatches?: Record<string, MatchPair[]>;
  logoAudit: LogoAudit;
  logosPerImage?: LogosPerImage;
  teamCount: number;
};

const GraphicsTeamsPage = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Record<string, string>>({});
  const [imageMatches, setImageMatches] = useState<Record<string, MatchPair[]>>({});
  const [logosPerImage, setLogosPerImage] = useState<LogosPerImage>({});
  const [logoAudit, setLogoAudit] = useState<LogoAudit | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setImages({});
    setImageMatches({});
    setLogosPerImage({});
    setLogoAudit(null);
    setTeamCount(null);
    try {
      const res = await apiGet<TeamsGraphicsResponse>("/api/graphics/teams");
      setImages(res.images || {});
      setImageMatches(res.imageMatches || {});
      setLogosPerImage(res.logosPerImage || {});
      setLogoAudit(res.logoAudit || null);
      setTeamCount(res.teamCount ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate teams graphics");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (key: string, dataUrl: string, matches?: MatchPair[]) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    let namePart = key;
    const logosForImage = logosPerImage[key];
    if (logosForImage?.length) {
      const logos = logosForImage
        .map((f) => f.replace(/\.[^.]+$/, "").replace(/\s+/g, "-").slice(0, 25))
        .join("_")
        .slice(0, 150);
      namePart = logos ? `${key}-${logos}` : key;
    } else if (matches?.length && logoAudit) {
      const teams = Array.from(new Set(matches.flatMap((m) => [m.homeTeam, m.awayTeam]).filter(Boolean)));
      const logoMap = new Map(logoAudit.resolved.map((r) => [r.teamName, r.logoFile]));
      const logos = teams
        .map((t) => logoMap.get(t) ?? t.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "").replace(/\s+/g, "-"))
        .map((f) => f.replace(/\.[^.]+$/, "").replace(/\s+/g, "-").slice(0, 25))
        .join("_")
        .slice(0, 150);
      namePart = logos ? `${key}-${logos}` : key;
    }
    link.download = `quinipolo-teams-${namePart}-${Date.now()}.png`;
    link.click();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Teams logo audit
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generates image2-style graphics for all teams from waterpolo_teams.csv to assess logo usage.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Generate all teams"}
            </Button>
            <Button component={Link} to="/graphics" size="small">
              ← Graphics generator
            </Button>
            <Button component={Link} to="/logo-mapper" size="small">
              Logo mapper
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {teamCount != null && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              {teamCount} teams from CSV → {Object.keys(images).length} images
            </Typography>
          )}

          {logoAudit && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Logo audit ({logoAudit.resolved.length} resolved, {logoAudit.missing.length} missing)
              </Typography>
              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Box sx={{ flex: "1 1 300px" }}>
                  <Typography variant="caption" color="success.main" fontWeight="bold">
                    Resolved (team → logo file)
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, maxHeight: 300, overflow: "auto", fontSize: 12 }}>
                    {logoAudit.resolved.map(({ teamName, logoFile, bgColor, dimensions }) => (
                      <li key={teamName}>
                        <strong>{teamName}</strong> → {logoFile}
                        {(bgColor || dimensions) && (
                          <Typography component="span" variant="caption" display="block" color="text.secondary">
                            {[dimensions, bgColor].filter(Boolean).join(" · ")}
                          </Typography>
                        )}
                      </li>
                    ))}
                  </Box>
                </Box>
                {logoAudit.missing.length > 0 && (
                  <Box sx={{ flex: "1 1 360px" }}>
                    <Typography variant="caption" color="error.main" fontWeight="bold">
                      Missing logos
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, maxHeight: 300, overflow: "auto", fontSize: 12 }}>
                      {logoAudit.missing.map((m) => {
                        const entry = typeof m === "string" ? { teamName: m, closestMatch: undefined } : m;
                        return (
                          <li key={entry.teamName} style={{ marginBottom: 4 }}>
                            {entry.teamName}
                            {entry.closestMatch && (
                              <Typography component="span" variant="caption" display="block" color="text.secondary">
                                Closest match: {entry.closestMatch}
                              </Typography>
                            )}
                          </li>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {Object.entries(images).map(([key, dataUrl]) => (
              <Box key={key} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                    {key}
                  </Typography>
                  <img
                    src={dataUrl}
                    alt={key}
                    style={{
                      maxWidth: 360,
                      maxHeight: 480,
                      border: "1px solid #ccc",
                      borderRadius: 8,
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => downloadImage(key, dataUrl, imageMatches[key])}
                    sx={{ mt: 1, display: "block", mx: "auto" }}
                  >
                    Download
                  </Button>
                </Box>
                {(imageMatches[key]?.length ?? 0) > 0 && logoAudit && (() => {
              const missingSet = new Set(
                logoAudit.missing.map((x) => (typeof x === "string" ? x : x.teamName))
              );
                return (
                <Box
                  sx={{
                    minWidth: 260,
                    maxWidth: 320,
                    p: 1.5,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    Bold = missing logo
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, fontSize: 13, lineHeight: 1.8 }}>
                    {imageMatches[key].map((m, idx) => {
                      const homeMissing = missingSet.has(m.homeTeam);
                      const awayMissing = missingSet.has(m.awayTeam);
                      return (
                        <Box component="li" key={idx} sx={{ mb: 0.5 }}>
                          {homeMissing ? (
                            <Box component="span" fontWeight="bold" color="error.main">
                              {m.homeTeam}
                            </Box>
                          ) : (
                            m.homeTeam
                          )}{" "}
                          vs{" "}
                          {awayMissing ? (
                            <Box component="span" fontWeight="bold" color="error.main">
                              {m.awayTeam}
                            </Box>
                          ) : (
                            m.awayTeam
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                );
              })()}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GraphicsTeamsPage;
