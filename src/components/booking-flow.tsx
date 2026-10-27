"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Copy, Locale } from "@/i18n/types";
import {
  ApiRefused,
  checkAvailability,
  createBooking,
  getGuest,
  getGuestToken,
  getSchedule,
  setGuestToken,
  type GuestProfile,
  type BookingRow,
} from "@/lib/api";
import { calendarCells, type CalendarCell } from "@/lib/schedule";
import { Stamp } from "./stamp";

type Step = "date" | "time" | "party" | "details" | "done";

const order = ["date", "time", "party", "details"] as const;

const slip = {
  enter: (direction: number) => ({ x: direction * 36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction * -36, opacity: 0 }),
};

// Same logging convention as the API, so dev tools read one story.
function logBook(action: string, detail: Record<string, unknown>) {
  console.info(`[iturrieta] ${action}`, detail);
}

function partyLine(book: Copy["book"], adults: number, children: number) {
  const adultText = adults === 1 ? book.adultOne : fill(book.adultMany, { n: adults });
  if (children === 0) return adultText;
  const childText = children === 1 ? book.childOne : fill(book.childMany, { n: children });
  return fill(book.partyJoin, { adults: adultText, children: childText });
}

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function formatLongDay(iso: string, locale: Locale) {
  const [year, month, day] = iso.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function monthSpan(today: string, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const from = new Date(`${today}T12:00:00Z`);
  const labels = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(from);
    date.setUTCDate(date.getUTCDate() + index);
    return formatter.format(date);
  });
  return [...new Set(labels)]
    .map((label) => label.charAt(0).toUpperCase() + label.slice(1))
    .join(locale === "es" ? " y " : " and ");
}

function FieldError({ message }: { message?: string }) {
  const reduce = useReducedMotion();
  if (!message) return null;

  return (
    <motion.p
      role="alert"
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="mt-2 text-sm text-pit"
    >
      {message}
    </motion.p>
  );
}


export function BookingFlow({
  locale,
  copy,
  today,
}: {
  locale: Locale;
  copy: Copy;
  today: string;
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const book = copy.book;
  const [step, setStep] = useState<Step>("date");
  const [direction, setDirection] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});
  const [confirmed, setConfirmed] = useState<BookingRow | null>(null);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  // The table the availability answer promised, shown on the details step.
  const [tablePreview, setTablePreview] = useState<string | null>(null);
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  // A synchronous lock: React state updates do not land between two clicks in
  // the same tick, so a ref is what really stops a double-submit from firing
  // two POSTs and two tables.
  const submitting = useRef(false);
  const requestId = useRef<string | null>(null);

  useEffect(() => {
    if (!getGuestToken()) return;
    getGuest()
      .then(setGuest)
      .catch(() => setGuestToken(null));
  }, []);

  // The lunch rules come from the API, not from the mock, so the calendar,
  // the chips, and the prices are whatever the owner has set.
  const schedule = useQuery({ queryKey: ["schedule"], queryFn: getSchedule });
  const rules = schedule.data;
  const seats = adults + children;
  const total = rules ? adults * rules.adultPrice + children * rules.childPrice : 0;
  const grid = rules ? calendarCells(today, rules) : { cells: [] as (CalendarCell | null)[] };

  function go(next: Step, dir: 1 | -1) {
    setDirection(dir);
    setStep(next);
  }

  // The API reason words turn into the copy lines. Day reasons only show up
  // here when something changed between the calendar and the check.
  function partyMessage(reason: string, maxParty?: number) {
    if (reason === "need-adult") return book.needAdult;
    if (reason === "above-max") {
      const limit = maxParty ?? rules?.maxParty;
      return limit === undefined
        ? book.aboveMaxFallback
        : fill(book.aboveMax, { max: limit });
    }
    if (reason === "no-table") return fill(book.noTable, { seats });
    if (reason === "request-conflict") return book.requestConflict;
    if (reason === "past" || reason === "window" || reason === "shut" || reason === "closed") {
      return book.chooseDay;
    }
    if (reason === "late") return book.chooseTime;
    return fill(book.full, { seats });
  }

  async function goNext() {
    if (step === "date") {
      if (!date) {
        setError(book.chooseDay);
        return;
      }
      setError("");
      logBook("date chosen", { date });
      go("time", 1);
      return;
    }

    if (step === "time") {
      if (!time) {
        setError(book.chooseTime);
        return;
      }
      setError("");
      logBook("arrival chosen", { date, time });
      go("party", 1);
      return;
    }

    if (step === "party") {
      if (!date || !time) return;
      if (submitting.current) return;
      submitting.current = true;
      // The API answers with the table or the reason; the check at confirm is
      // the same service, so this step can only be a preview.
      setChecking(true);
      try {
        const answer = await checkAvailability({ date, time, adults, children });
        if (answer.table) {
          setError("");
          setTablePreview(answer.table.name);
          logBook("party accepted", { date, seats, table: answer.table.name });
          go("details", 1);
          return;
        }
        if (answer.reason) {
          setError(partyMessage(answer.reason, answer.maxParty));
          logBook("party refused", { date, seats, reason: answer.reason });
        }
      } catch {
        setError(book.apiDown);
      } finally {
        setChecking(false);
        submitting.current = false;
      }
      return;
    }

    if (step === "details") {
      const nextErrors = {
        name: name.trim().length < 2 ? book.nameError : undefined,
        phone: phone.replace(/\D/g, "").length < 6 ? book.phoneError : undefined,
      };
      setFieldErrors(nextErrors);
      if (nextErrors.name || nextErrors.phone || !date || !time) return;
      if (!getGuestToken()) {
        router.push(`/${locale}/account?returnTo=/${locale}/book`);
        return;
      }
      if (submitting.current) return;

      submitting.current = true;
      setSending(true);
      try {
        const done = await createBooking({
          date,
          time,
          name: name.trim(),
          phone: phone.trim(),
          adults,
          children,
          requestId: requestId.current ?? (requestId.current = crypto.randomUUID()),
        });
        // The API runs the same checks again: another guest may have taken
        // the table while the details were typed.
        setConfirmed(done);
        setError("");
        go("done", 1);
      } catch (caught) {
        if (caught instanceof ApiRefused) {
          setError(partyMessage(caught.reason, caught.maxParty));
          go("party", -1);
        } else {
          setError(book.apiDown);
        }
      } finally {
        setSending(false);
        submitting.current = false;
      }
    }
  }

  function goBack() {
    const index = order.indexOf(step as (typeof order)[number]);
    if (index > 0) {
      setError("");
      go(order[index - 1], -1);
    }
  }

  function again() {
    requestId.current = null;
    setDate(null);
    setTime(null);
    setAdults(2);
    setChildren(0);
    setName("");
    setPhone("");
    setConfirmed(null);
    setFieldErrors({});
    setError("");
    go("date", -1);
  }

  return (
    <motion.section
      key={locale}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-12 lg:grid-cols-[0.78fr_1.22fr] lg:py-16"
    >
      <div>
        <p className="text-haze">{book.eyebrow}</p>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-bark sm:text-6xl">{book.title}</h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-haze">{book.intro}</p>
        <ul className="mt-8 max-w-md border-t border-bark/10">
          {book.aside.map((line) => (
            <li key={line} className="border-b border-bark/10 py-3 leading-6 text-bark">
              {line}
            </li>
          ))}
        </ul>
        <a
          href={`/${locale}`}
          className="mt-8 inline-block text-sm text-leaf underline-offset-4 hover:underline"
        >
          {book.back}
        </a>
      </div>

      <div className="bg-foam text-bark">
        <div aria-hidden className="h-0.5 bg-pour" />
        <div className="px-4 py-6 sm:px-8 sm:py-8">
        {step !== "done" && (
          <ol className="relative grid grid-cols-4 gap-2 border-b border-bark/10 pb-3">
            {order.map((item, index) => {
              const active = item === step;
              const reached = order.indexOf(step as (typeof order)[number]) >= index;
              return (
                <li key={item}>
                  <button
                    type="button"
                    disabled={!reached}
                    aria-current={active ? "step" : undefined}
                    onClick={() => {
                      if (item === step) return;
                      setError("");
                      go(item, -1);
                    }}
                    className={`relative w-full py-2 text-left text-sm ${
                      active ? "text-bark" : reached ? "text-haze" : "text-bark/30"
                    }`}
                  >
                    {book.steps[item]}
                    {active && (
                      <motion.span
                        layoutId={reduce ? undefined : "book-step"}
                        className="absolute right-3 bottom-0 left-0 h-px bg-pour"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {schedule.isError && <FieldError message={book.apiDown} />}

        <div className="overflow-hidden [perspective:1400px]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={reduce ? undefined : slip}
              initial={reduce ? false : "enter"}
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[24rem] pt-6"
            >
              {step === "date" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    goNext();
                  }}
                >
                  <p className="font-serif text-2xl text-bark">{monthSpan(today, locale)}</p>
                  <p className="mt-2 text-haze">{book.dateHint}</p>
                  <div className="mt-5 grid grid-cols-7 gap-1">
                    {book.weekdays.map((label) => (
                      <span
                        key={label}
                        className="pb-2 text-center text-xs text-haze"
                      >
                        {label}
                      </span>
                    ))}
                    {grid.cells.map((cell, index) => (
                      <div key={cell?.iso ?? `empty-${index}`} className="flex justify-center">
                        {cell ? (
                          <DayChip
                            iso={cell.iso}
                            state={cell.state}
                            selected={cell.iso === date}
                            today={today}
                            closedLabel={book.closed}
                            onPick={(iso) => {
                              requestId.current = null;
                              setDate(iso);
                              setTablePreview(null);
                              setError("");
                            }}
                          />
                        ) : (
                          <span className="h-10 w-10 sm:h-11 sm:w-11" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-haze">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-pour" />
                      {book.today}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-pit" />
                      {book.closed}
                    </span>
                    <span className="inline-flex items-center gap-2 text-bark/40">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-bark/25" />
                      {book.shut}
                    </span>
                  </p>
                  <FieldError message={error} />
                  <StepActions book={book} onBack={null} busy={schedule.isPending} />
                </form>
              )}

              {step === "time" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    goNext();
                  }}
                >
                  <p className="font-serif text-2xl text-bark">
                    {date ? formatLongDay(date, locale) : ""}
                  </p>
                  <p className="mt-2 text-haze">{book.timeHint}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {(rules?.slots ?? []).map((slot) => (
                      <Stamp key={slot}>
                        <button
                          type="button"
                          aria-pressed={slot === time}
                          onClick={() => {
                            requestId.current = null;
                            setTime(slot);
                            setTablePreview(null);
                            setError("");
                          }}
                          className={`relative z-10 rounded-full px-4 py-2 font-serif text-xl transition-colors ${
                            slot === time
                              ? "bg-leaf text-foam"
                              : "text-bark hover:bg-bark/5"
                          }`}
                        >
                          {slot}
                        </button>
                      </Stamp>
                    ))}
                  </div>
                  <FieldError message={error} />
                  <StepActions book={book} onBack={goBack} busy={schedule.isPending} />
                </form>
              )}

              {step === "party" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    goNext();
                  }}
                >
                  <Counter
                    label={book.adults}
                    price={`€${rules?.adultPrice ?? 45}`}
                    value={adults}
                    minusLabel={book.fewerAdults}
                    plusLabel={book.moreAdults}
                    minusDisabled={adults <= 1}
                    plusDisabled={seats >= 16}
                    onMinus={() => {
                      requestId.current = null;
                      setAdults((value) => Math.max(1, value - 1));
                      setTablePreview(null);
                      setError("");
                    }}
                    onPlus={() => {
                      requestId.current = null;
                      setAdults((value) => value + 1);
                      setTablePreview(null);
                      setError("");
                    }}
                  />
                  <Counter
                    label={book.children}
                    price={`€${rules?.childPrice ?? 16}`}
                    value={children}
                    minusLabel={book.fewerChildren}
                    plusLabel={book.moreChildren}
                    minusDisabled={children <= 0}
                    plusDisabled={seats >= 16}
                    onMinus={() => {
                      requestId.current = null;
                      setChildren((value) => Math.max(0, value - 1));
                      setTablePreview(null);
                      setError("");
                    }}
                    onPlus={() => {
                      requestId.current = null;
                      setChildren((value) => value + 1);
                      setTablePreview(null);
                      setError("");
                    }}
                  />
                  <p className="mt-5 font-serif text-2xl text-bark">{fill(book.seats, { n: seats })}</p>
                  <p className="mt-1 text-haze">{fill(book.priceNote, { total })}</p>
                  <FieldError message={error} />
                  <StepActions
                    book={book}
                    onBack={goBack}
                    busy={checking}
                    actionLabel={checking ? book.checkingAvailability : book.next}
                  />
                </form>
              )}

              {step === "details" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    goNext();
                  }}
                >
                  {tablePreview && (
                    <p role="status" className="mb-5 border-l-2 border-pour pl-4 text-haze">
                      {fill(book.tablePreview, { name: tablePreview })}
                    </p>
                  )}
                  <Field
                    label={book.name}
                    value={name}
                    autoComplete="name"
                    error={fieldErrors.name}
                    onChange={(value) => {
                      requestId.current = null;
                      setName(value);
                      setFieldErrors((current) => ({ ...current, name: undefined }));
                    }}
                  />
                  <Field
                    label={book.phone}
                    value={phone}
                    autoComplete="tel"
                    inputMode="tel"
                    error={fieldErrors.phone}
                    onChange={(value) => {
                      requestId.current = null;
                      setPhone(value);
                      setFieldErrors((current) => ({ ...current, phone: undefined }));
                    }}
                  />
                  {guest ? (
                    <p className="mt-5 border-t border-bark/10 pt-4 text-sm text-haze">
                      {book.email}: <span className="text-bark">{guest.email}</span>
                    </p>
                  ) : (
                    <div className="mt-5 border-t border-bark/10 pt-4">
                      <p className="text-sm text-haze">{copy.guest.accountRequired}</p>
                      <Link
                        href={`/${locale}/account?returnTo=/${locale}/book`}
                        className="mt-3 inline-block text-sm text-leaf underline-offset-4 hover:underline"
                      >
                        {copy.guest.signInToBook}
                      </Link>
                    </div>
                  )}
                  <FieldError message={error} />
                  <StepActions
                    book={book}
                    onBack={goBack}
                    busy={sending}
                    actionLabel={sending ? book.confirmingBooking : book.confirmBooking}
                  />
                </form>
              )}

              {step === "done" && date && time && confirmed && (
                <div>
                  <p className="text-leaf">{book.confirmed}</p>
                  <h2 className="mt-2 font-serif text-4xl leading-tight text-bark sm:text-5xl">
                    {book.confirmedTitle}
                  </h2>
                  <p className="mt-4 max-w-md text-lg leading-7 text-haze">
                    {fill(book.held, { name: confirmed.name })}
                  </p>
                  <span aria-hidden className="mt-6 block h-px bg-pour" />
                  <dl className="mt-6">
                    <Row label={book.steps.date} value={formatLongDay(confirmed.date, locale)} />
                    <Row label={book.arrival} value={confirmed.time} />
                    <Row
                      label={book.steps.party}
                      value={partyLine(book, confirmed.adults, confirmed.children)}
                    />
                    <Row
                      label={book.tableAssigned}
                      value={fill(book.tableLine, { name: confirmed.table })}
                    />
                  </dl>
                  <p className="mt-4 text-haze">
                    {fill(book.priceNote, { total: confirmed.total })}
                  </p>
                  <div className="mt-8">
                    <Stamp>
                      <button
                        type="button"
                        onClick={again}
                        className="relative z-10 rounded-full bg-leaf px-6 py-3 text-foam"
                      >
                        {book.again}
                      </button>
                    </Stamp>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        </div>
      </div>
    </motion.section>
  );
}

// While the schedule is still loading the calendar is not ready; the step
// button waits instead of offering an empty grid.

function DayChip({
  iso,
  state,
  selected,
  today,
  closedLabel,
  onPick,
}: {
  iso: string;
  state: CalendarCell["state"];
  selected: boolean;
  today: string;
  closedLabel: string;
  onPick: (iso: string) => void;
}) {
  const day = Number(iso.slice(8));
  const open = state === "open";
  const isToday = iso === today;
  const className = `relative z-10 flex h-11 w-11 items-center justify-center rounded-full font-serif text-lg ${
    selected
      ? "bg-leaf text-foam"
      : state === "closed"
        ? "text-pit"
        : open
          ? "text-bark hover:bg-bark/5"
          : "text-bark/30"
  }`;
  const mark =
    isToday && !selected ? (
      <span aria-hidden className="absolute bottom-1.5 h-1 w-1 rounded-full bg-pour" />
    ) : null;

  if (!open) {
    return (
      <span className={className} aria-label={state === "closed" ? `${day}, ${closedLabel}` : undefined}>
        {day}
        {mark}
      </span>
    );
  }

  return (
    <Stamp>
      <button
        type="button"
        data-day={iso}
        aria-pressed={selected}
        onClick={() => onPick(iso)}
        className={className}
      >
        {day}
        {mark}
      </button>
    </Stamp>
  );
}

function Counter({
  label,
  price,
  value,
  minusLabel,
  plusLabel,
  minusDisabled,
  plusDisabled,
  onMinus,
  onPlus,
}: {
  label: string;
  price: string;
  value: number;
  minusLabel: string;
  plusLabel: string;
  minusDisabled: boolean;
  plusDisabled: boolean;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="flex items-center justify-between border-b border-bark/10 py-4">
      <div>
        <p className="font-serif text-2xl text-bark">{label}</p>
        <p className="text-sm text-haze">{price}</p>
      </div>
      <div className="flex items-center gap-3">
        <Stamp disabled={minusDisabled}>
          <button
            type="button"
            aria-label={minusLabel}
            disabled={minusDisabled}
            onClick={onMinus}
            className="relative z-10 h-11 w-11 rounded-full text-xl text-bark ring-1 ring-bark/15 disabled:text-bark/30"
          >
            −
          </button>
        </Stamp>
        <span className="relative grid h-10 w-8 place-items-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={reduce ? false : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -10, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-3xl text-bark"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <Stamp disabled={plusDisabled}>
          <button
            type="button"
            aria-label={plusLabel}
            disabled={plusDisabled}
            onClick={onPlus}
            className="relative z-10 h-11 w-11 rounded-full text-xl text-bark ring-1 ring-bark/15 disabled:text-bark/30"
          >
            +
          </button>
        </Stamp>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  autoComplete,
  inputMode,
  error,
  onChange,
}: {
  label: string;
  value: string;
  autoComplete: string;
  inputMode?: "tel" | "email";
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm text-haze">{label}</span>
      <input
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border-b border-bark/25 bg-transparent py-2 font-serif text-2xl text-bark transition-colors focus:border-leaf"
      />
      <FieldError message={error} />
    </label>
  );
}

function StepActions({
  book,
  onBack,
  busy,
  actionLabel,
}: {
  book: Copy["book"];
  onBack: (() => void) | null;
  busy: boolean;
  actionLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-haze underline-offset-4 hover:text-bark hover:underline"
        >
          {book.backStep}
        </button>
      ) : (
        <span />
      )}
      <Stamp disabled={busy}>
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="relative z-10 rounded-full bg-leaf px-6 py-3 text-foam disabled:text-foam/70"
        >
          {actionLabel ?? book.next}
        </button>
      </Stamp>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-bark/10 py-3">
      <dt className="text-sm text-haze">{label}</dt>
      <dd className="text-right font-serif text-xl text-bark">{value}</dd>
    </div>
  );
}
