"use client";

import { useState } from "react";
import { Bookmark, CalendarPlus, ChevronRight, MapPin } from "lucide-react";
import { Sheet } from "@/components/sheet";
import { Pills } from "@/components/ui";
import { downloadCalendar } from "@/lib/calendar";
import type { AgendaItem } from "@/lib/types";
import { agendaDays } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Screen } from "@/components/ui";
import { agendaDayFor, cn } from "@/lib/utils";

export default function ItineraryPage() {
  const { agenda, quest, toggleQuest, notify } = useApp();
  const [scope, setScope] = useState<"all" | "saved">("all");
  const [exportedId, setExportedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AgendaItem | null>(null);
  const [dayId, setDayId] = useState(agendaDayFor);
  const day = agendaDays.find((item) => item.id === dayId) ?? agendaDays[0];
  const items = agenda.filter((item) => item.dayId === day.id && (scope === "all" || quest[`agenda:${item.id}`]));

  return (
    <Screen title="Itinerary">
      <div className="stagger space-y-4 px-4 py-4">
        <section className="px-1 pb-2 pt-1"><p className="eyebrow">15–17 NOVEMBER · PORTOFINO</p><h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-ink">Three days to remember.</h2><p className="mt-2 text-sm leading-5 text-muted">Your gathering, from the first welcome to the final farewell.</p></section>
        <Pills value={scope} onChange={setScope} options={[{value:"all",label:"Full programme"},{value:"saved",label:"My saved plans"}]} />
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
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-semibold tracking-wide text-gold-ink">{day.dateLabel.toUpperCase()}</p>
          <h2 className="font-serif text-3xl text-navy">{day.title}</h2></div>
          <button type="button" aria-label="Export visible activities to calendar" disabled={!items.length} onClick={() => { if (downloadCalendar(items)) notify("Calendar file downloaded · Portofino local time"); }} className="glass grid h-11 w-11 shrink-0 place-items-center text-navy disabled:opacity-40"><CalendarPlus size={20}/></button>
        </div>
        {!items.length ? <div className="glass p-6 text-center"><Bookmark size={24} className="mx-auto text-navy"/><h3 className="mt-3 font-semibold">A day to make your own</h3><p className="mt-2 text-sm text-muted">Save activities from the full programme to find them here.</p><button type="button" onClick={() => setScope("all")} className="primary-button mx-auto mt-4 px-5 py-3 text-sm">Explore the programme</button></div> : null}
        <ol className="relative space-y-3 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-line">
          {items.map((item) => (
            <li key={item.id} className="relative pl-7">
              <span className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-navy bg-cream" />
              <article className="card overflow-hidden">
                <button type="button" onClick={() => setSelected(item)} className="flex w-full items-center gap-3 p-4 text-left"><div className="flex-1"><p className="eyebrow">{item.time} · LOCAL TIME</p><h3 className="mt-1 font-semibold text-ink">{item.title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin size={12}/>{item.place}</p></div><ChevronRight size={17} className="text-muted"/></button>
                <button type="button" aria-pressed={Boolean(quest[`agenda:${item.id}`])} onClick={() => toggleQuest(`agenda:${item.id}`)} className="flex min-h-11 w-full items-center gap-2 border-t border-ink/5 px-4 text-xs font-medium text-navy"><Bookmark size={14} fill={quest[`agenda:${item.id}`] ? "currentColor" : "none"}/>{quest[`agenda:${item.id}`] ? "Saved to your plans" : "Save to my plans"}</button>
              </article>
            </li>
          ))}
        </ol>
      </div>
      {selected ? <Sheet title={selected.title} onClose={() => setSelected(null)}><p className="eyebrow">{day.dateLabel} · {selected.time} · PORTOFINO LOCAL TIME</p><p className="mt-3 flex items-center gap-2 text-sm font-medium"><MapPin size={16}/>{selected.place}</p><p className="mt-5 text-sm leading-7 text-muted">{selected.detail}</p><button type="button" onClick={() => { if (downloadCalendar([selected])) { setExportedId(selected.id); notify("Calendar file downloaded"); } }} className="primary-button mt-6 w-full py-4 text-sm font-semibold">{exportedId === selected.id ? "Calendar downloaded · Download again" : "Add to my calendar"}</button></Sheet> : null}
    </Screen>
  );
}
