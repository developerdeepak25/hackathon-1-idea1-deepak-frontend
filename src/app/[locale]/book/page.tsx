import { connection } from "next/server";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking-flow";
import { PublicShell } from "@/components/public-shell";
import { getCopy } from "@/i18n/get-copy";
import { isLocale } from "@/i18n/types";
import { madridToday } from "@/mocks/house";

export const instant = false;

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await connection();
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getCopy(locale);

  return (
    <PublicShell locale={locale} copy={copy}>
      <BookingFlow locale={locale} copy={copy} today={madridToday()} />
    </PublicShell>
  );
}
