import type { Copy, Locale } from "@/i18n/types";
import { AppleMark } from "./motifs";
import { SealLink } from "./seal-link";

export function SiteFooter({ locale, copy }: { locale: Locale; copy: Copy }) {
  return (
    <footer className="mt-auto bg-leaf-deep text-foam">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.3fr_1fr_auto] sm:items-end">
        <div>
          <div className="flex items-center gap-3 text-stave">
            <AppleMark className="h-8 w-8" />
            <p className="font-serif text-2xl text-foam">Iturrieta</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-6 text-foam/75">{copy.footer.place}</p>
        </div>
        <div>
          <p className="font-serif text-xl leading-snug">{copy.footer.hours}</p>
          <p className="mt-2 text-sm text-foam/75">{copy.footer.season}</p>
        </div>
        <SealLink href={`/${locale}/book`} tone="gold">
          {copy.nav.book}
        </SealLink>
      </div>
    </footer>
  );
}
