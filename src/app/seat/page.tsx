"use client";

import { PassWallet } from "@/components/pass-wallet";
import { Screen } from "@/components/ui";
import { eventMeta } from "@/lib/data";
import { useApp } from "@/lib/store";
import { seatFor, teamById } from "@/lib/utils";

export default function SeatPage() {
  const { profile } = useApp();
  const pass = seatFor(profile.name);
  const squad = teamById(profile.teamId);

  return (
    <Screen title="My Wallet" back="/">
      <div className="stagger space-y-4 px-4 py-4">
        <PassWallet />
        <article className="ticket">
          <div className="flex items-start justify-between px-5 pb-4 pt-5">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-gold-ink">PFC · PORTOFINO</p>
              <h2 className="mt-2 font-serif text-3xl text-navy">{profile.name}</h2>
              <p className="mt-1 text-sm text-muted">{squad.name}</p>
            </div>
            <span
              className="grid h-14 w-14 place-items-center rounded-full text-sm font-bold shadow-[inset_0_1px_0_rgb(255_255_255_/_0.6),0_6px_14px_rgb(11_46_91_/_0.18)]"
              style={{ background: squad.color, color: squad.ink }}
            >
              {squad.name.replace(" Squad", "").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="ticket-perf mx-0" />
          <dl className="grid grid-cols-2 gap-4 px-5 py-5 text-sm">
            <div>
              <dt className="text-[11px] tracking-wide text-muted">COACH</dt>
              <dd className="mt-1 font-serif text-2xl text-navy">{pass.coach}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted">SEAT</dt>
              <dd className="mt-1 font-serif text-2xl text-navy">{pass.seat}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted">ROOM</dt>
              <dd className="mt-1 font-serif text-2xl text-navy">{pass.room}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-muted">DINNER</dt>
              <dd className="mt-1 font-serif text-2xl text-navy">Table {pass.dinnerTable}</dd>
            </div>
          </dl>
          <div className="px-5 pb-5">
            <div className="barcode rounded-md" aria-hidden="true" />
            <p className="mt-2 text-center text-[10px] tracking-[0.28em] text-muted">{profile.id.toUpperCase()}</p>
          </div>
        </article>

        <section className="card divide-y divide-line">
          {[
            ["Hotel", `${eventMeta.venue}, room ${pass.room}`],
            ["Welcome dinner", `Terrace, table ${pass.dinnerTable}`],
            ["Gala", `Harbour, table ${pass.galaTable}`],
            ["Forum", `Row ${pass.forumRow}, seat ${pass.forumSeat}`],
            ["Coach back", `Coach ${pass.coach}, 17 Nov, 14:30`],
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
