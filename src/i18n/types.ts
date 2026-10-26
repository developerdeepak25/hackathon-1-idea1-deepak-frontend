export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export type Copy = {
  meta: { title: string; description: string };
  nav: {
    house: string;
    txotx: string;
    menu: string;
    gatherings: string;
    book: string;
    open: string;
    close: string;
  };
  hero: {
    place: string;
    established: string;
    lede: string;
    book: string;
    menu: string;
  };
  facts: { label: string; value: string }[];
  txotx: {
    title: string;
    lede: string;
    steps: { title: string; body: string }[];
  };
  lunch: {
    title: string;
    body: string;
    notes: { label: string; value: string }[];
    included: string;
  };
  menuItems: { name: string; note: string; price: string }[];
  valley: { title: string; body: string; place: string };
  gatherings: { title: string; emptyTitle: string; empty: string };
  footer: { place: string; hours: string; season: string };
  book: {
    eyebrow: string;
    title: string;
    intro: string;
    aside: [string, string, string];
    today: string;
    back: string;
    steps: { date: string; time: string; party: string; details: string };
    next: string;
    backStep: string;
    weekdays: [string, string, string, string, string, string, string];
    monthsLead: string;
    dateHint: string;
    chooseDay: string;
    closed: string;
    shut: string;
    timeHint: string;
    chooseTime: string;
    busy: string;
    adults: string;
    children: string;
    fewerAdults: string;
    moreAdults: string;
    fewerChildren: string;
    moreChildren: string;
    seats: string;
    priceNote: string;
    aboveMax: string;
    noTable: string;
    full: string;
    needAdult: string;
    name: string;
    phone: string;
    email: string;
    nameError: string;
    phoneError: string;
    emailError: string;
    confirmed: string;
    confirmedTitle: string;
    held: string;
    arrival: string;
    adultOne: string;
    adultMany: string;
    childOne: string;
    childMany: string;
    partyJoin: string;
    tableLine: string;
    again: string;
  };
};

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "es";
}
