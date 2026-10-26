import type { ReactNode } from "react";
import type { Copy, Locale } from "@/i18n/types";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PublicShell({
  locale,
  copy,
  children,
}: {
  locale: Locale;
  copy: Copy;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader locale={locale} copy={copy} />
      <div className="flex-1">{children}</div>
      <SiteFooter copy={copy} />
    </div>
  );
}
