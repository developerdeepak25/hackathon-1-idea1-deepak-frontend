import { notFound } from "next/navigation";
import { LocaleLang } from "@/components/locale-lang";
import { getCopy } from "@/i18n/get-copy";
import { isLocale, locales, type Locale } from "@/i18n/types";

export const instant = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getCopy(locale);
  return { title: copy.meta.title, description: copy.meta.description };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <LocaleLang locale={locale as Locale} />
      {children}
    </>
  );
}
