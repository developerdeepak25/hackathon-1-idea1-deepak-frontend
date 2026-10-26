"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState, type PointerEvent } from "react";
import type { Copy } from "@/i18n/types";
import type { Table } from "@/mocks/house";
import { useHouse } from "@/state/house-store";

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function AdminFloor({ copy }: { copy: Copy }) {
  const admin = copy.admin;
  const reduce = useReducedMotion();
  const { state, moveTable, addTable, updateTable } = useHouse();
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null);
  const [live, setLive] = useState<{ id: string; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(state.tables[0]?.id ?? null);
  const table = state.tables.find((item) => item.id === selected) ?? null;

  function point(event: PointerEvent) {
    const rect = board.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onDown(event: PointerEvent<HTMLButtonElement>, item: Table) {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* The pointer can already be gone. The drag still follows the move events. */
    }
    const here = point(event);
    drag.current = { id: item.id, dx: item.x - here.x, dy: item.y - here.y, x: item.x, y: item.y };
    setSelected(item.id);
    setLive({ id: item.id, x: item.x, y: item.y });
  }

  function onMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const here = point(event);
    const x = clamp(here.x + drag.current.dx);
    const y = clamp(here.y + drag.current.dy);
    drag.current = { ...drag.current, x, y };
    setLive({ id: drag.current.id, x, y });
  }

  function onUp() {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    moveTable(current.id, current.x, current.y);
    setLive(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-haze">{admin.dragHint}</p>
        <button
          type="button"
          onClick={addTable}
          className="rounded-full bg-pour px-4 py-2 text-sm font-medium text-bark"
        >
          {admin.addTable}
        </button>
      </div>
      <div className="mt-4 overflow-auto overscroll-contain rounded-2xl border border-bark/10 bg-leaf-deep">
        <div ref={board} className="relative min-h-80 min-w-[40rem]">
          {state.tables.map((item) => {
            const dragging = live?.id === item.id;
            const x = dragging ? live.x : item.x;
            const y = dragging ? live.y : item.y;
            return (
              <motion.button
                key={item.id}
                type="button"
                aria-label={`${admin.tableName} ${item.name}`}
                onPointerDown={(event) => onDown(event, item)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                animate={{ left: `${x}%`, top: `${y}%` }}
                transition={{ duration: reduce || dragging ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 touch-none flex-col items-center justify-center rounded-full border text-sm ${
                  item.active
                    ? "border-pour bg-foam text-bark"
                    : "border-foam/30 bg-leaf text-foam/50"
                } ${selected === item.id ? "ring-2 ring-pour" : ""}`}
              >
                <span className="font-serif text-lg leading-none">{item.name}</span>
                <span className="text-[11px]">{item.seats}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
      {table && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-bark/10 bg-foam p-4 sm:grid-cols-3">
          <label className="text-sm text-haze">
            {admin.tableName}
            <input
              value={table.name}
              onChange={(event) => updateTable(table.id, { name: event.target.value })}
              className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
            />
          </label>
          <label className="text-sm text-haze">
            {admin.seats}
            <input
              type="number"
              min={1}
              max={20}
              value={table.seats}
              onChange={(event) =>
                updateTable(table.id, { seats: Math.max(1, Number(event.target.value) || 1) })
              }
              className="mt-1 w-full border-b border-bark/20 bg-transparent py-2 text-base text-bark outline-none focus:border-leaf"
            />
          </label>
          <button
            type="button"
            onClick={() => updateTable(table.id, { active: !table.active })}
            className="self-end rounded-full border border-bark/20 px-4 py-2 text-sm text-bark"
          >
            {table.active ? admin.putAway : admin.onFloor}
          </button>
        </div>
      )}
    </div>
  );
}
