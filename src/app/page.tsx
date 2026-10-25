"use client";

import Link from "next/link";
import { ArrowUpRight, Armchair, CalendarDays, ChevronRight, Gamepad2, Images, Info, MessageCircle, Sun, Trophy } from "lucide-react";
import { BellButton } from "@/components/header";
import { GameIcon } from "@/components/game-icon";
import { PassWallet } from "@/components/pass-wallet";
import { Screen } from "@/components/ui";
import { eventMeta, games, teams } from "@/lib/data";
import { useApp } from "@/lib/store";
import { countdown, initials, teamById } from "@/lib/utils";

const actions = [
  { href: "/event", label: "Event guide", icon: Info, color: "#dce9de", ink: "#41694d" },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays, color: "#e2eafa", ink: "#4164a5" },
  { href: "/seat", label: "My pass", icon: Armchair, color: "#f3e8ce", ink: "#86642c" },
  { href: "/games", label: "Play & earn", icon: Gamepad2, color: "#f9e2d7", ink: "#ab6242" },
  { href: "/gallery", label: "PicBot", icon: Images, color: "#d9ebed", ink: "#397583" },
  { href: "/leaderboard", label: "Rankings", icon: Trophy, color: "#f4e9bf", ink: "#85661d" },
];

export default function HomePage() {
  const { profile, teamPoints, messagesFor, points, announcements, completionFor, peopleScores } = useApp();
  const clock = countdown();
  const squad = teamById(profile.teamId);
  const ranked = [...teams].sort((a, b) => teamPoints(b.id, "overall") - teamPoints(a.id, "overall") || a.name.localeCompare(b.name));
  const rank = ranked.findIndex((team) => team.id === squad.id) + 1;
  const latest = messagesFor(profile.teamId).at(-1);
  const news = announcements[0];
  const contribution = peopleScores("overall").find((person) => person.you)?.points ?? points;
  const challenge = games.find((game) => !completionFor(game.id)) ?? games[0];
  const allComplete = games.every((game) => Boolean(completionFor(game.id)));

  return (
    <Screen>
      <section className="home-landscape px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <span className="glass flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-medium"><Sun size={15} className="text-gold-ink" />15–17 NOV · PORTOFINO</span>
          <div className="flex items-center gap-1"><BellButton /><Link href="/profile" aria-label="Your profile" className="avatar">{initials(profile.name)}</Link></div>
        </div>
        <p className="eyebrow mt-7">YOUR RIVIERA, YOUR WAY</p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.055em] text-ink">Buongiorno, {profile.name.split(" ")[0]}.</h1>
        <p className="mt-1 text-sm text-muted">Discover and play · Hotel Splendido</p>
        <div className="mt-16 flex justify-between pb-3"><Link href="/event" className="destination-link">Explore Portofino <ArrowUpRight size={14}/></Link><Link href="/hub" className="destination-link">Event guide <ChevronRight size={14}/></Link></div>
      </section>
      <div className="home-content stagger space-y-4 px-5 pb-6">
        <section className="glass relative p-5">
          <div className="flex items-center justify-between"><p className="eyebrow">{allComplete ? "ALL CHALLENGES COMPLETE" : "YOUR NEXT ADVENTURE"}</p><span className="rounded-full bg-navy/10 px-2.5 py-1 text-xs font-semibold text-navy">+{challenge.points} pts</span></div>
          <div className="mt-3 flex items-center gap-3"><div className="flex-1"><h2 className="text-2xl font-semibold tracking-tight">{challenge.title}</h2><p className="mt-1 text-sm leading-5 text-muted">{challenge.blurb}</p></div><GameIcon kind={challenge.kind} /></div>
          <div className="mt-4 flex gap-2"><Link href={`/games/${challenge.id}`} className="primary-button flex-1 py-3 text-center text-sm font-semibold">{allComplete ? "View challenge" : "Let’s play"} <span aria-hidden="true">↗</span></Link><Link href="/itinerary" className="rounded-full bg-white/65 px-5 py-3 text-sm font-semibold">Full itinerary</Link></div>
        </section>

        <Link href="/leaderboard" className="card block p-4">
          <div className="flex items-center justify-between"><span className="eyebrow">BETTER TOGETHER</span><ChevronRight size={16} className="text-muted"/></div>
          <div className="mt-3 flex items-center gap-3"><span className="app-icon h-12 w-12 text-xl font-semibold" style={{background:squad.color,color:squad.ink}}>{rank.toString().padStart(2,"0")}</span><div className="flex-1"><h2 className="font-semibold">{squad.name}</h2><p className="text-xs text-muted">{contribution} points contributed by you</p></div><div className="text-right"><p className="text-2xl font-semibold tracking-tight tabular-nums">{teamPoints(squad.id,"overall")}</p><p className="text-[10px] text-muted">SQUAD POINTS</p></div></div>
        </Link>
        <div className="glass p-4"><PassWallet /></div>
        <section className="glass p-4">
          <div className="mb-3 flex items-baseline justify-between"><h2 className="text-lg font-semibold tracking-tight">Make it your gathering</h2><Link href="/hub" className="text-xs font-medium text-navy">View all ↗</Link></div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-4">{actions.map(({href,label,icon:Icon,color,ink}) => <Link key={href} href={href} className="pressable flex flex-col items-center gap-2 text-center"><span className="app-icon" style={{background:color,color:ink}}><Icon size={25} strokeWidth={1.7}/></span><span className="text-[11px] font-medium">{label}</span></Link>)}</div>
        </section>
        {latest ? <Link href="/chat" className="card flex gap-3 p-4"><MessageCircle size={22} className="mt-1 shrink-0 text-navy"/><div className="min-w-0"><div className="flex items-center justify-between"><p className="eyebrow">SQUAD CONVERSATIONS</p><span className="text-xs text-navy">Open ↗</span></div><p className="mt-2 text-sm font-semibold">{latest.author}</p><p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{latest.body}</p></div></Link> : null}
        {news ? <Link href="/event" className="block border-t border-line pt-4"><p className="eyebrow">FROM THE EVENT DESK · {news.when}</p><h2 className="mt-2 font-semibold">{news.title}</h2><p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{news.body}</p></Link> : null}
        <p className="pt-2 text-center text-[10px] font-medium tracking-[0.15em] text-muted">{clock.kicker} {clock.value} {clock.unit} · {eventMeta.dates}</p>
      </div>
    </Screen>
  );
}
