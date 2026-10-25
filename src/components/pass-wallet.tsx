"use client";

import { useState } from "react";
import { Armchair, BedDouble, ChevronRight, Utensils } from "lucide-react";
import { Sheet } from "@/components/sheet";
import { useApp } from "@/lib/store";
import { seatFor, teamById } from "@/lib/utils";

export function PassWallet() {
  const { profile } = useApp();
  const seat = seatFor(profile.name);
  const squad = teamById(profile.teamId);
  const [selected, setSelected] = useState<number | null>(null);
  const passes = [
    { title: "Coastal transfer", kind: "BOARDING PASS", icon: Armchair, color: "blue", code: `Coach ${seat.coach}`, value: `Seat ${seat.seat}`, detail: "Genoa → Portofino", note: "Find your coach at the PFC airport welcome desk. Return transfer: 17 Nov, 14:30.", fields: [["COACH", seat.coach], ["SEAT", seat.seat], ["RETURN", "17 NOV · 14:30"]] },
    { title: "Your Riviera stay", kind: "ROOM KEY", icon: BedDouble, color: "green", code: "Splendido", value: `Room ${seat.room}`, detail: "Hotel Splendido · Portofino", note: "Room keys are available at the hotel reception from 15:00 on arrival day.", fields: [["ROOM", seat.room], ["CHECK-IN", "15 NOV · 15:00"], ["HOTEL", "Splendido"]] },
    { title: "A seat at the table", kind: "DINNER INVITATION", icon: Utensils, color: "gold", code: "Welcome dinner", value: `Table ${seat.dinnerTable}`, detail: "Terrace · 15 Nov · 19:30", note: "Bring a light layer for the terrace. Your gala dinner is at the harbour on 16 Nov at 20:00.", fields: [["WELCOME", `Table ${seat.dinnerTable}`], ["GALA", `Table ${seat.galaTable}`], ["FORUM", `${seat.forumRow} · ${seat.forumSeat}`]] },
  ];
  const current = selected === null ? null : passes[selected];
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between"><h2 className="text-lg font-semibold tracking-tight">Your pocket wallet</h2><span className="eyebrow">3 PERSONAL PASSES</span></div>
      <div className="space-y-3">{passes.map((pass, index) => <button type="button" key={pass.kind} onClick={() => setSelected(index)} className={`wallet-pass wallet-${pass.color}`}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/50"><pass.icon size={23} strokeWidth={1.5}/></span>
        <span className="min-w-0 flex-1 text-left"><span className="block text-[9px] font-semibold tracking-[.16em] opacity-70">{pass.kind}</span><span className="mt-1 block text-sm font-semibold">{pass.code}</span></span>
        <span className="pass-stub text-sm font-semibold">{pass.value}<ChevronRight size={15}/></span>
      </button>)}</div>
      {current ? <Sheet title={current.title} onClose={() => setSelected(null)}>
        <article className={`ticket wallet-detail wallet-${current.color}`}>
          <div className="p-5"><p className="eyebrow">PFC · {current.kind}</p><h3 className="mt-5 text-3xl font-semibold tracking-tight">{profile.name}</h3><p className="mt-1 text-sm">{squad.name}</p><p className="mt-5 text-sm font-medium">{current.detail}</p></div>
          <dl className="ticket-perf grid grid-cols-2 gap-5 p-5">{current.fields.map(([label,value]) => <div key={label}><dt className="eyebrow">{label}</dt><dd className="mt-1 text-xl font-semibold">{value}</dd></div>)}</dl>
          <div className="px-5 pb-5"><div className="barcode" aria-hidden="true"/><p className="mt-2 text-center text-[9px] tracking-[.14em]">{profile.id.toUpperCase()}</p></div>
        </article>
        <p className="mt-5 text-sm leading-6 text-muted">{current.note}</p>
      </Sheet> : null}
    </section>
  );
}
