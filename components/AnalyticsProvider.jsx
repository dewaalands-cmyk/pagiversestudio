"use client";

import { useAnalytics } from "@/lib/useAnalytics";

export default function AnalyticsProvider({ children }) {
  useAnalytics();
  return <>{children}</>;
}
