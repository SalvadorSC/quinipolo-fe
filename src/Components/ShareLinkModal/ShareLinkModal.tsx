import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  IconButton,
  Chip,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  ContentCopy,
  Share,
  Link as LinkIcon,
  Delete,
  AccessTime,
  People,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost, apiPut } from "../../utils/apiUtils";

interface ShareLink {
  id: string;
  shareToken: string;
  expiresAt: string;
  maxUses: number | null;
  usesCount: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

interface ShareLinkModalProps {
  open: boolean;
  leagueId: string;
  userId: string;
  onClose: () => void;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  open,
  leagueId,
  userId,
  onClose,
}) => {
  const { t } = useTranslation();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Build the complete share URL using production domain
  const buildShareUrl = (shareToken: string) => {
    return `https://www.quinipolo.com/join-league/${shareToken}`;
  };

  const fetchShareLinks = useCallback(async () => {
    try {
      setLoading(true);
      const links = await apiGet(
        `/api/leagues/${leagueId}/share-links?userId=${userId}`
      );
      setShareLinks(links as ShareLink[]);
    } catch (error) {
      console.error("Error fetching share links:", error);
    } finally {
      setLoading(false);
    }
  }, [leagueId, userId]);

  useEffect(() => {
    if (open) {
      fetchShareLinks();
    }
  }, [open, leagueId, fetchShareLinks]);

  const createShareLink = async () => {
    try {
      setCreating(true);
      const newLink = await apiPost(`/api/leagues/${leagueId}/share-link`, {
        userId,
        expiresInDays,
        maxUses,
      });

      // Add the new link to the list
      setShareLinks((prev) => [newLink as ShareLink, ...prev]);

      // Reset form
      setExpiresInDays(7);
      setMaxUses(null);
    } catch (error) {
      console.error("Error creating share link:", error);
    } finally {
      setCreating(false);
    }
  };

  const deactivateShareLink = async (shareLinkId: string) => {
    try {
      await apiPut(
        `/api/leagues/${leagueId}/share-links/${shareLinkId}/deactivate`,
        {
          userId,
        }
      );

      // Update the link in the list
      setShareLinks((prev) =>
        prev.map((link) =>
          link.id === shareLinkId ? { ...link, isActive: false } : link
        )
      );
    } catch (error) {
      console.error("Error deactivating share link:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date() > new Date(expiresAt);
  };

  const isMaxUsesReached = (link: ShareLink) => {
    return link.maxUses && link.usesCount >= link.maxUses;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      sx={{ borderRadius: 8 }}
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Share />
          <Typography variant="h6">{t("shareLeague")}</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Create new share link form */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("createShareLink")}
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label={t("expiresInDays")}
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  inputProps={{ min: 1, max: 365 }}
                  sx={{ width: 150 }}
                />
                <TextField
                  label={t("maxUses")}
                  type="number"
                  value={maxUses || ""}
                  onChange={(e) =>
                    setMaxUses(e.target.value ? Number(e.target.value) : null)
                  }
                  inputProps={{ min: 1 }}
                  placeholder={t("unlimited")}
                  sx={{ width: 150 }}
                />
              </Stack>
              <LoadingButton
                className="gradient-primary"
                variant="contained"
                onClick={createShareLink}
                loading={creating}
                startIcon={<LinkIcon />}
                sx={{
                  alignSelf: "flex-start",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                {t("generateShareLink")}
              </LoadingButton>
            </Stack>
          </Box>

          <Divider />

          {/* Existing share links */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {t("existingShareLinks")}
            </Typography>

            {loading ? (
              <Typography>{t("loading")}...</Typography>
            ) : shareLinks.length === 0 ? (
              <Alert severity="info">{t("noShareLinks")}</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("shareLink")}</TableCell>
                      <TableCell>{t("expiresAt")}</TableCell>
                      <TableCell>{t("uses")}</TableCell>
                      <TableCell>{t("status")}</TableCell>
                      <TableCell>{t("actions")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shareLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {buildShareUrl(link.shareToken)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                copyToClipboard(buildShareUrl(link.shareToken))
                              }
                              color={
                                copiedLink === buildShareUrl(link.shareToken)
                                  ? "success"
                                  : "default"
                              }
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <AccessTime fontSize="small" />
                            <Typography variant="body2">
                              {formatDate(link.expiresAt)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <People fontSize="small" />
                            <Typography variant="body2">
                              {link.usesCount}
                              {link.maxUses && ` / ${link.maxUses}`}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              !link.isActive
                                ? t("inactive")
                                : isExpired(link.expiresAt)
                                ? t("expired")
                                : isMaxUsesReached(link)
                                ? t("maxUsesReached")
                                : t("active")
                            }
                            color={
                              !link.isActive
                                ? "default"
                                : isExpired(link.expiresAt) ||
                                  isMaxUsesReached(link)
                                ? "error"
                                : "success"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {link.isActive && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => deactivateShareLink(link.id)}
                              startIcon={<Delete />}
                            >
                              {t("deactivate")}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("close")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareLinkModal;
