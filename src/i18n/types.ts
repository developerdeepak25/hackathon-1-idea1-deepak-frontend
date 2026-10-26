export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export type Copy = {
  meta: { title: string; description: string };
  nav: {
    house: string;
    menu: string;
    gatherings: string;
    book: string;
    open: string;
    close: string;
  };
  hero: {
    eyebrow: string;
    established: string;
    lede: string;
    book: string;
    menu: string;
  };
  facts: { label: string; value: string }[];
  lunch: { eyebrow: string; title: string; body: string };
  menuItems: { name: string; note: string; price: string }[];
  gatherings: { eyebrow: string; title: string; empty: string };
  footer: { place: string };
  book: { eyebrow: string; title: string; body: string; back: string };
};

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "es";
}
