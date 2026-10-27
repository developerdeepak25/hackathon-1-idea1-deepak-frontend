import { connection } from "next/server";
import { notFound } from "next/navigation";
import { GuestAccount } from "@/components/guest-account";
import { PublicShell } from "@/components/public-shell";
import { getCopy } from "@/i18n/get-copy";
import { isLocale } from "@/i18n/types";

export const instant = false;

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  await connection();
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getCopy(locale);
  const { returnTo } = await searchParams;

  return (
    <PublicShell locale={locale} copy={copy}>
      <GuestAccount
        locale={locale}
        copy={copy}
        returnTo={Array.isArray(returnTo) ? returnTo[0] : returnTo}
      />
    </PublicShell>
  );
}
