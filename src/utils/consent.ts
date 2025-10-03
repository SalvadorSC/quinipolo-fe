export type ConsentValue = "accepted" | "declined";

export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent";
export const CONSENT_CHANGED_EVENT = "consent:changed";

export function getStoredConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (value === "accepted" || value === "declined") return value;
    return null;
  } catch {
    return null;
  }
}

export function setStoredConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGED_EVENT, { detail: value })
  );
}

export function hasConsent(): boolean {
  return getStoredConsent() === "accepted";
}
