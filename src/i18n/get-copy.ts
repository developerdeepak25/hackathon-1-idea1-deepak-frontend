import { en } from "./en";
import { es } from "./es";
import { isLocale, type Copy, type Locale } from "./types";

const copies = { en, es };

export function getCopy(locale: string): Copy {
  return isLocale(locale) ? copies[locale] : en;
}

export function swapLocale(pathname: string, locale: Locale) {
  if (pathname === "/") return `/${locale}`;
  return pathname.replace(/^\/(en|es)(?=\/|$)/, `/${locale}`);
}
