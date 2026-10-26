"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/types";

// The root <html> cannot read the route, so the locale layout sets lang after paint.
export function LocaleLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
