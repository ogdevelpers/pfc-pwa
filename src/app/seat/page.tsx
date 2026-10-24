"use client";

import { Screen } from "@/components/ui";
import { eventMeta } from "@/lib/data";
import { useApp } from "@/lib/store";
import { seatFor, teamById } from "@/lib/utils";

export default function SeatPage() {
  const { profile } = useApp();
  const pass = seatFor(profile.name);
  const squad = teamById(profile.teamId);

  return (
    <Screen title="My Seat" back="/">
      <div className="space-y-4 px-4 py-4">
        <article className="overflow-hidden rounded-[28px] bg-navy text-white shadow-card">
          <div className="flex items-start justify-between px-5 pb-4 pt-5">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-gold">BOARDING PASS</p>
              <h2 className="mt-2 font-serif text-3xl">{profile.name}</h2>
              <p className="mt-1 text-sm text-white/75">{squad.name}</p>
            </div>
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold"
              style={{ background: squad.color, color: squad.ink }}
            >
              {squad.name.replace(" Squad", "").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="mx-5 border-t border-dashed border-white/25" />
          <dl className="grid grid-cols-2 gap-4 px-5 py-5 text-sm">
            <div>
              <dt className="text-[11px] tracking-wide text-white/60">COACH</dt>
              <dd className="mt-1 font-serif text-2xl">{pass.coach}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-white/60">SEAT</dt>
              <dd className="mt-1 font-serif text-2xl">{pass.seat}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-white/60">ROOM</dt>
              <dd className="mt-1 font-serif text-2xl">{pass.room}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-white/60">DINNER</dt>
              <dd className="mt-1 font-serif text-2xl">Table {pass.dinnerTable}</dd>
            </div>
          </dl>
        </article>

        <section className="card divide-y divide-line">
          {[
            ["Hotel", `${eventMeta.venue}, room ${pass.room}`],
            ["Welcome dinner", `Terrace, table ${pass.dinnerTable}`],
            ["Gala", `Harbour, table ${pass.galaTable}`],
            ["Forum", `Row ${pass.forumRow}, seat ${pass.forumSeat}`],
            ["Coach back", `Coach ${pass.coach}, Monday 14:30`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5">
              <span className="text-sm text-muted">{label}</span>
              <span className="text-right text-sm font-semibold text-navy">{value}</span>
            </div>
          ))}
        </section>

        <p className="px-1 text-sm leading-6 text-muted">
          Show this at the lobby desk if a list and a smile disagree. Wifi is {eventMeta.wifi}, password {eventMeta.wifiPassword}.
        </p>
      </div>
    </Screen>
  );
}
