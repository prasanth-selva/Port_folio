"use client";

import { useEffect } from "react";

/**
 * Counts one homepage view per browser tab per day. No cookie, visitor ID,
 * fingerprint, or IP address is stored; the server uses IP only for an
 * in-memory abuse throttle.
 */
export default function PortfolioPageView() {
  useEffect(() => {
    try {
      const key = `portfolio-view:${new Date().toISOString().slice(0, 10)}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
      void fetch("/api/analytics/view", { method: "POST", keepalive: true }).catch(() => {
        // Analytics are best-effort and must never affect the public experience.
      });
    } catch {
      // Storage may be disabled; do not block the page or fail hydration.
    }
  }, []);

  return null;
}
