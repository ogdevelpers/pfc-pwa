"use client";

import Link from "next/link";
import { Screen } from "@/components/ui";
import { games, teams } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn, formatPhone, initials, teamById } from "@/lib/utils";

export default function ProfilePage() {
  const { profile, updateProfile, points, completions, mode, signOut, teamPoints } = useApp();
  const squad = teamById(profile.teamId);
  const rank =
    [...teams]
      .sort((a, b) => teamPoints(b.id, "overall") - teamPoints(a.id, "overall"))
      .findIndex((team) => team.id === profile.teamId) + 1;
  const status =
    mode === "live"
      ? "Live with Supabase. Chat and scores are shared."
      : mode === "offline"
        ? "Supabase is configured, but it did not answer. This phone is keeping your place."
        : mode === "connecting"
          ? "Connecting to Supabase."
          : "Saved on this phone. Add Supabase keys when you want a shared board and live chat.";

  return (
    <Screen title="Profile">
      <div className="space-y-4 px-4 py-4">
        <section className="card flex items-center gap-4 p-4">
          <span
            className="grid h-16 w-16 place-items-center rounded-3xl font-serif text-2xl"
            style={{ background: squad.color, color: squad.ink }}
          >
            {initials(profile.name)}
          </span>
          <span>
            <span className="block font-serif text-2xl text-navy">{profile.name}</span>
            <span className="text-sm text-muted">{squad.name}</span>
          </span>
        </section>

        <section className="grid grid-cols-3 gap-2">
          {[
            [String(points), "Your points"],
            [String(completions.length), `of ${games.length} played`],
            [`#${rank}`, "Squad rank"],
          ].map(([value, label]) => (
            <article key={label} className="card px-2 py-3 text-center">
              <p className="font-serif text-2xl text-navy">{value}</p>
              <p className="text-[11px] text-muted">{label}</p>
            </article>
          ))}
        </section>

        <section className="card space-y-2 p-4">
          <p className="text-xs font-semibold tracking-wide text-muted">GUEST LIST</p>
          <p className="text-sm leading-6 text-navy">
            Signed in as {profile.name} on {formatPhone(profile.phone ?? "")}. Your squad comes from the guest list.
          </p>
        </section>

        <section className="card flex items-center justify-between gap-3 p-4">
          <span>
            <span className="block font-semibold text-navy">Announcement alerts</span>
            <span className="text-sm text-muted">The bell dot on new notes.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={profile.notifications}
            onClick={() => updateProfile({ notifications: !profile.notifications })}
            className={cn("h-7 w-12 rounded-full p-1", profile.notifications ? "bg-navy" : "bg-line")}
          >
            <span className={cn("block h-5 w-5 rounded-full bg-white transition", profile.notifications && "translate-x-5")} />
          </button>
        </section>

        <section className="card p-4">
          <p className="text-xs font-semibold tracking-wide text-muted">SYNC</p>
          <p className="mt-2 text-sm leading-6">{status}</p>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Link href="/seat" className="card py-3 text-center text-sm font-semibold text-navy">
            My seat
          </Link>
          <Link href="/event" className="card py-3 text-center text-sm font-semibold text-navy">
            Event info
          </Link>
        </div>

        <button type="button" onClick={signOut} className="w-full rounded-full py-3 text-sm font-semibold text-red-700">
          Sign out
        </button>
      </div>
    </Screen>
  );
}
