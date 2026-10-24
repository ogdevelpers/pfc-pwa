"use client";

import { useState } from "react";
import { agendaDays } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui";
import { agendaDayFor, cn } from "@/lib/utils";

export default function ItineraryPage() {
  const { agenda } = useApp();
  const [dayId, setDayId] = useState(agendaDayFor);
  const day = agendaDays.find((item) => item.id === dayId) ?? agendaDays[0];
  const items = agenda.filter((item) => item.dayId === day.id);

  return (
    <Screen title="Itinerary">
      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {agendaDays.map((item) => {
            const active = item.id === day.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDayId(item.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl px-2 py-3 text-center",
                  active ? "bg-navy text-white" : "bg-white text-navy shadow-card",
                )}
              >
                <span className="block text-[11px] font-semibold tracking-wide opacity-80">{item.weekday}</span>
                <span className="mt-1 block font-serif text-lg leading-none">{item.dateLabel}</span>
              </button>
            );
          })}
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-gold-ink">{day.dateLabel.toUpperCase()}</p>
          <h2 className="font-serif text-3xl text-navy">{day.title}</h2>
        </div>
        <ol className="relative space-y-3">
          <span className="absolute bottom-4 left-[7px] top-4 w-px bg-line" />
          {items.map((item) => (
            <li key={item.id} className="relative pl-7">
              <span className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-navy bg-cream" />
              <article className="card p-4">
                <p className="text-xs font-semibold text-gold-ink">{item.time}</p>
                <h3 className="mt-1 font-semibold text-navy">{item.title}</h3>
                <p className="text-sm text-muted">{item.place}</p>
                <p className="mt-2 text-sm leading-6">{item.detail}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </Screen>
  );
}
