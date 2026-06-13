import { useEffect } from "react";

const SESSION_ID = (() => {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("__analytics_session_id");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem("__analytics_session_id", id);
  }
  return id;
})();

async function trackEvent(eventType: string, pagePathOverride?: string) {
  if (typeof window === "undefined") return;
  try {
    const pagePath = pagePathOverride || window.location.pathname;
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        page_path: pagePath,
        session_id: SESSION_ID,
      }),
    });
  } catch (err) {
    console.error("Analytics error:", err);
  }
}

export function useAnalytics() {
  useEffect(() => {
    trackEvent("page_view");
  }, []);

  return {
    trackClick: (target: string) => trackEvent("click", target),
    trackFormSubmit: (formName: string) => trackEvent("form_submit", formName),
    trackScroll: () => trackEvent("scroll"),
  };
}

export { trackEvent, SESSION_ID };
