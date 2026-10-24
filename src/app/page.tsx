"use client";

import Image from "next/image";
import Link from "next/link";
import { Armchair, CalendarDays, Gamepad2, Images, Info, Trophy } from "lucide-react";
import { BellButton } from "@/components/header";
import { CrownMark } from "@/components/crown";
import { Screen } from "@/components/ui";
import { announcements, eventMeta, teams } from "@/lib/data";
import { useApp } from "@/lib/store";
import { countdown, teamById } from "@/lib/utils";

const actions = [
  { href: "/event", label: "Event Info", icon: Info },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/seat", label: "My Seat", icon: Armchair },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function HomePage() {
  const { profile, teamPoints, messagesFor, points } = useApp();
  const clock = countdown();
  const squad = teamById(profile.teamId);
  const ranked = [...teams].sort(
    (a, b) => teamPoints(b.id, "overall") - teamPoints(a.id, "overall") || a.name.localeCompare(b.name),
  );
  const rank = ranked.findIndex((team) => team.id === squad.id) + 1;
  const latest = messagesFor(profile.teamId).at(-1);
  const news = announcements[0];

  return (
    <Screen>
      <div className="space-y-4 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <section className="relative min-h-[340px] overflow-hidden rounded-[28px] text-white shadow-card">
          <Image src={eventMeta.hero} alt="" fill priority className="object-cover" sizes="430px" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/55 via-navy/78 to-navy/95" />
          <div className="absolute right-2 top-2 z-10">
            <BellButton />
          </div>
          <div className="relative flex min-h-[340px] flex-col items-center px-6 pb-16 pt-8 text-center">
            <CrownMark className="h-7 w-12 text-gold" />
            <p className="mt-2 font-serif text-5xl tracking-[0.18em]">PFC</p>
            <p className="mt-5 text-[11px] font-semibold tracking-[0.32em] text-gold">WELCOME TO</p>
            <h1 className="font-serif text-[2.6rem] leading-none">THE EVENT</h1>
            <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-6 text-white/80">{eventMeta.welcome}</p>
          </div>
        </section>

        <section className="card relative z-10 -mt-12 mx-1 flex items-center gap-4 p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e7eef8] text-navy">
            <CalendarDays size={26} />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">{clock.kicker}</p>
            <p className="font-serif text-4xl leading-none text-navy">
              {clock.value} {clock.unit ? <span className="text-2xl">{clock.unit}</span> : null}
            </p>
            <p className="mt-1 text-xs text-muted">{eventMeta.dates}</p>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="card flex flex-col items-center gap-2 px-2 py-4 text-center active:scale-[0.98]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7eef8] text-navy">
                  <Icon size={22} />
                </span>
                <span className="text-xs font-semibold text-navy">{action.label}</span>
              </Link>
            );
          })}
        </div>

        <Link href="/leaderboard" className="card flex items-center gap-3 p-4">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl font-serif text-xl"
            style={{ background: squad.color, color: squad.ink }}
          >
            {rank}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold tracking-wide text-muted">YOUR SQUAD</span>
            <span className="block truncate font-semibold text-navy">{squad.name}</span>
            <span className="block text-sm text-muted">{points} points from you</span>
          </span>
          <span className="text-right">
            <span className="block font-serif text-3xl leading-none text-navy">{teamPoints(squad.id, "overall")}</span>
            <span className="text-xs text-muted">squad pts</span>
          </span>
        </Link>

        {latest ? (
          <Link href="/chat" className="card block p-4">
            <span className="flex items-center justify-between text-xs font-semibold tracking-wide text-muted">
              TEAM CHAT
              <span className="text-navy">Open</span>
            </span>
            <span className="mt-2 block font-semibold text-navy">{latest.author}</span>
            <span className="mt-1 line-clamp-2 block text-sm leading-6 text-muted">{latest.body}</span>
          </Link>
        ) : null}

        <Link href="/event" className="card block p-4">
          <span className="text-xs font-semibold tracking-wide text-gold-ink">{news.when}</span>
          <span className="mt-1 block font-semibold text-navy">{news.title}</span>
          <span className="mt-1 line-clamp-3 block text-sm leading-6 text-muted">{news.body}</span>
        </Link>
      </div>
    </Screen>
  );
}
