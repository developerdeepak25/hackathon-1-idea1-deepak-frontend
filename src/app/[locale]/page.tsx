import { notFound } from "next/navigation";

export const instant = false;
import { HousePage } from "@/components/house-page";
import { getCopy } from "@/i18n/get-copy";
import { isLocale } from "@/i18n/types";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <HousePage locale={locale} copy={getCopy(locale)} />;
}
