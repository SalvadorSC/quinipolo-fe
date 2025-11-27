import {
  CONFIDENCE_THRESHOLD_HIGH,
  CONFIDENCE_THRESHOLD_LOW,
} from "./constants";

export function getConfidenceColor(confidence: number) {
  if (confidence >= CONFIDENCE_THRESHOLD_HIGH) {
    return { background: "#4caf50", color: "#fff" };
  }
  if (confidence >= CONFIDENCE_THRESHOLD_LOW) {
    return { background: "#ff9800", color: "#fff" };
  }
  return { background: "#f44336", color: "#fff" };
}

export function getConfidenceLabel(
  confidence: number,
  t: (key: string) => string
): string {
  if (confidence >= CONFIDENCE_THRESHOLD_HIGH) {
    return t("resultsAutoFill.confidenceHigh") || "High";
  }
  if (confidence >= CONFIDENCE_THRESHOLD_LOW) {
    return t("resultsAutoFill.confidenceMedium") || "Medium";
  }
  return t("resultsAutoFill.confidenceLow") || "Low";
}

export function getOutcomeLabel(outcome: string, t: (key: string) => string): string {
  if (outcome === "Tie" || outcome === "Tie (PEN)") {
    return t("resultsAutoFill.outcome.tie") || "Tie";
  }
  return outcome;
}

export function isTie(outcome: string): boolean {
  return outcome === "Tie" || outcome === "Tie (PEN)";
}

