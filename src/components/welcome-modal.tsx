"use client";

import { ChevronDown } from "lucide-react";
import { CrownMark } from "@/components/crown";
import { Sheet } from "@/components/sheet";
import { eventMeta, people } from "@/lib/data";
import { useApp } from "@/lib/store";
import { formatPhone, initials, seatFor, teamById } from "@/lib/utils";

export function WelcomeModal({ onClose }: { onClose: () => void }) {
  const { profile, peopleScores } = useApp();
  const squad = teamById(profile.teamId);
  const pass = seatFor(profile.name);
  const members = peopleScores("overall").filter((person) => person.teamId === squad.id);
  const captain = people.find((person) => person.teamId === squad.id && person.role === "Team Captain");
  const details = [
    ["Mobile number", formatPhone(profile.phone ?? "")],
    ["Guest ID", profile.id],
    ["Hotel", eventMeta.venue],
    ["Room", String(pass.room)],
    ["Transfer", `Coach ${pass.coach} · Seat ${pass.seat}`],
    ["Welcome dinner", `Table ${pass.dinnerTable}`],
    ["Gala dinner", `Table ${pass.galaTable}`],
    ["Forum", `Row ${pass.forumRow} · Seat ${pass.forumSeat}`],
  ];

  return (
    <Sheet title="Welcome to Portofino" eyebrow={`Signed in as ${profile.name}`} className="welcome-modal" onClose={onClose}>
      <div className="py-3 text-center">
        <div className="squad-emblem mx-auto" style={{ backgroundColor: squad.color, color: squad.ink }}><CrownMark className="h-12 w-16" /></div>
        <h3 className="mt-7 text-[1.75rem] font-semibold leading-tight tracking-[-.04em]">You’re in {squad.name}</h3>
        <p className="mt-2 text-sm text-muted">{captain ? `Captain ${captain.name} · ` : ""}{members.length} squad members</p>
        <div className="mt-5 flex justify-center -space-x-2" aria-label="Your squad members">
          {members.slice(0, 5).map((member) => <span key={member.id} title={member.name} aria-label={member.name} className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-xs font-semibold" style={{ backgroundColor: squad.color, color: squad.ink }}>{initials(member.name)}</span>)}
          {members.length > 5 ? <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-white text-xs font-semibold">+{members.length - 5}</span> : null}
        </div>
      </div>
      <details className="guest-details mt-4 rounded-2xl border border-white/70 bg-white/30">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-muted">Your guest details & passes <ChevronDown size={15} className="transition-transform" /></summary>
        <div className="px-4 pb-4"><p className="mb-3 text-xs leading-5 text-muted">{eventMeta.place} · {eventMeta.dates}</p><dl className="divide-y divide-ink/10">
          {details.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-5 py-3"><dt className="shrink-0 text-xs leading-5 text-muted">{label}</dt><dd className="min-w-0 break-words text-right text-sm font-medium">{value}</dd></div>)}
        </dl></div>
      </details>
      <button type="button" onClick={onClose} className="primary-button mt-5 w-full py-4 text-sm font-semibold">Enter the gathering</button>
    </Sheet>
  );
}
