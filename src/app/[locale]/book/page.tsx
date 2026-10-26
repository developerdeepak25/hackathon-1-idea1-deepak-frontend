import { notFound } from "next/navigation";

export const instant = false;
import { PublicShell } from "@/components/public-shell";
import { Reveal } from "@/components/reveal";
import { SealLink } from "@/components/seal-link";
import { getCopy } from "@/i18n/get-copy";
import { isLocale } from "@/i18n/types";

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getCopy(locale);

  return (
    <PublicShell locale={locale} copy={copy}>
      <Reveal className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
        <p className="text-sm tracking-[0.22em] text-oxblood uppercase">
          {copy.book.eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-6xl leading-none text-ink">
          {copy.book.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-wood">{copy.book.body}</p>
        <div className="mt-8">
          <SealLink href={`/${locale}`} tone="apple">
            {copy.book.back}
          </SealLink>
        </div>
      </Reveal>
    </PublicShell>
  );
}
