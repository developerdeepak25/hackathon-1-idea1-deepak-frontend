"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { Copy } from "@/i18n/types";
import { useHouse } from "@/state/house-store";

function PublishSwitch({
  on,
  published,
  draft,
  onChange,
}: {
  on: boolean;
  published: string;
  draft: string;
  onChange: (value: boolean) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-3"
    >
      <span className="relative h-11 w-[4.75rem] rounded-full bg-bark/10 p-1">
        <motion.span
          aria-hidden
          className="absolute top-1 bottom-1 left-1 w-9 rounded-full bg-pour"
          animate={{ x: on ? 32 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
        />
      </span>
      <span className="text-sm text-bark">{on ? published : draft}</span>
    </button>
  );
}

export function AdminEvents({ copy, today }: { copy: Copy; today: string }) {
  const admin = copy.admin;
  const { state, addEvent, updateEvent } = useHouse();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [price, setPrice] = useState("");

  function save() {
    if (title.trim().length < 2) return;
    addEvent({
      title: title.trim(),
      date,
      description: description.trim(),
      capacity,
      price: price.trim(),
    });
    setTitle("");
    setDescription("");
    setPrice("");
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-3 rounded-2xl border border-bark/10 bg-foam p-4">
        <label className="text-sm text-haze">
          {admin.eventTitle}
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-haze">
            {admin.eventDate}
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none"
            />
          </label>
          <label className="text-sm text-haze">
            {admin.eventCapacity}
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(Math.max(1, Number(event.target.value) || 1))}
              className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none"
            />
          </label>
          <label className="text-sm text-haze">
            {admin.eventPrice}
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none"
            />
          </label>
        </div>
        <label className="text-sm text-haze">
          {admin.eventDescription}
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
          />
        </label>
        <button
          type="button"
          onClick={save}
          className="justify-self-start rounded-full bg-pour px-4 py-2 text-sm font-medium text-bark"
        >
          {admin.addEvent}
        </button>
      </div>

      {state.events.length === 0 ? (
        <p className="text-haze">{admin.emptyEvents}</p>
      ) : (
        <ul className="grid gap-4">
          {state.events.map((event) => (
            <li key={event.id} className="border-t border-bark/10 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-haze">{event.date}</p>
                  <p className="font-serif text-2xl text-bark">{event.title}</p>
                  <p className="mt-2 max-w-xl text-haze">{event.description}</p>
                </div>
                <PublishSwitch
                  on={event.published}
                  published={admin.published}
                  draft={admin.draft}
                  onChange={(published) => updateEvent(event.id, { published })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
