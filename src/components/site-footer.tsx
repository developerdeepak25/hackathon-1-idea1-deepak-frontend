import type { Copy } from "@/i18n/types";
import { AppleMark } from "./motifs";

export function SiteFooter({ copy }: { copy: Copy }) {
  return (
    <footer className="mt-auto border-t border-cider/40 bg-apple-deep text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cider text-apple-deep">
            <AppleMark className="h-7 w-7" />
          </span>
          <p className="font-serif text-lg">Iturrieta</p>
        </div>
        <p className="text-sm text-cream/80">{copy.footer.place}</p>
      </div>
    </footer>
  );
}
