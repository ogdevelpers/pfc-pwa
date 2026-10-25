"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Images, Info, MessageCircle, Trophy, Gamepad2 } from "lucide-react";
import { Screen } from "@/components/ui";

const features = [
  {
    href: "/event",
    title: "Event Information",
    text: "Announcements, essentials, and the details you will actually need.",
    icon: Info,
  },
  {
    href: "/games",
    title: "Games & Engagement",
    text: "Trivia, photo quests, squad tasks, and a spin of the wheel.",
    icon: Gamepad2,
  },
  {
    href: "/itinerary",
    title: "Event Schedule",
    text: "Three days, at a glance, from the airport desk to the last coach.",
    icon: CalendarDays,
  },
  {
    href: "/gallery",
    title: "Image PicBot",
    text: "Find the photos, the people, and the frames you are in.",
    icon: Images,
  },
  {
    href: "/leaderboard",
    title: "Leaderboard",
    text: "Squad ranks, daily movement, and how each challenge is scoring.",
    icon: Trophy,
  },
  {
    href: "/chat",
    title: "In-App Team Chat",
    text: "Your squad’s thread for reminders, plans, and a little rivalry.",
    icon: MessageCircle,
  },
];

export default function HubPage() {
  return (
    <Screen title="Hub">
      <div className="stagger space-y-3 px-4 py-4">
        <section className="px-1 pb-3 pt-1"><p className="eyebrow">YOUR POCKET COMPANION</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">A gathering of possibilities.</h2><p className="mt-2 text-sm leading-5 text-muted">Explore, connect, and make yourself at home.</p></section>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.href} href={feature.href} className="card flex items-center gap-3 p-4 active:scale-[0.99]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e7eef8] text-navy">
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-navy">{feature.title}</span>
                <span className="mt-1 block text-sm leading-5 text-muted">{feature.text}</span>
              </span>
              <ChevronRight className="shrink-0 text-muted" size={18} />
            </Link>
          );
        })}
      </div>
    </Screen>
  );
}
