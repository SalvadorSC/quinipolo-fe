// Lightweight GA4 integration that loads gtag.js when a measurement ID is present

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

function loadGaScript(measurementId: string) {
  if (document.getElementById("ga4-script")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.id = "ga4-script";
  script.onload = () => {
    console.info("[Analytics] GA4 script loaded");
  };
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });
}

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID) return;
  console.info("[Analytics] Initializing GA4 with ID:", GA_MEASUREMENT_ID);
  loadGaScript(GA_MEASUREMENT_ID);
}

export function trackPageView(path: string) {
  if (!GA_MEASUREMENT_ID) {
    console.debug("[Analytics] page_view skipped (no GA ID)", { path });
    return;
  }
  if (!window.gtag) {
    console.debug("[Analytics] page_view queued/missed (gtag not ready)", {
      path,
    });
    return;
  }
  console.debug("[Analytics] page_view", { path });
  window.gtag("event", "page_view", {
    page_path: path,
  });
}

export function trackLogin(method: string) {
  if (!GA_MEASUREMENT_ID) {
    console.debug("[Analytics] login skipped (no GA ID)", { method });
    return;
  }
  if (!window.gtag) {
    console.debug("[Analytics] login queued/missed (gtag not ready)", {
      method,
    });
    return;
  }
  console.debug("[Analytics] login", { method });
  window.gtag("event", "login", {
    method,
  });
}

export function trackSignup(method: string) {
  if (!GA_MEASUREMENT_ID) {
    console.debug("[Analytics] sign_up skipped (no GA ID)", { method });
    return;
  }
  if (!window.gtag) {
    console.debug("[Analytics] sign_up queued/missed (gtag not ready)", {
      method,
    });
    return;
  }
  console.debug("[Analytics] sign_up", { method });
  window.gtag("event", "sign_up", {
    method,
  });
}
