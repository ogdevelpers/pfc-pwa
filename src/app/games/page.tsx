"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { GameIcon } from "@/components/game-icon";
import { Pills, Screen } from "@/components/ui";
import { games } from "@/lib/data";
import { useApp } from "@/lib/store";

type Filter = "all" | "upcoming" | "completed";

export default function GamesPage() {
  const { completionFor } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const visible = games.filter((game) => {
    const done = Boolean(completionFor(game.id));
    if (filter === "completed") return done;
    if (filter === "upcoming") return !done;
    return true;
  });

  return (
    <Screen title="Games" back="/">
      <div className="stagger space-y-4 px-4 py-4">
        <section className="px-1 pb-2 pt-1"><p className="eyebrow">A LITTLE FRIENDLY RIVALRY</p><h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-ink">Let the good times play.</h2><p className="mt-2 text-sm leading-5 text-muted">Discover the coast, take on a challenge, and bring your squad a little closer.</p></section>
        <Pills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "upcoming", label: "Upcoming" },
            { value: "completed", label: "Completed" },
          ]}
        />
        {visible.length === 0 ? (
          <p className="card px-4 py-8 text-center text-sm text-muted">
            {filter === "completed" ? "Finished games will land here." : "You have played every challenge."}
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((game) => {
              const completion = completionFor(game.id);
              return (
                <Link key={game.id} href={`/games/${game.id}`} className="card flex items-center gap-3 p-3 active:scale-[0.99]">
                  <span className="relative">
                    <GameIcon kind={game.kind} />
                    {completion ? (
                      <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-navy text-white">
                        <Check size={12} />
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">{game.title}</span>
                    <span className="block text-sm text-muted">{game.subtitle}</span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-bold text-navy">
                    {completion ? (
                      <>Earned {completion.points}</>
                    ) : game.kind === "spin" ? (
                      <>Up to {game.points}</>
                    ) : (
                      <>+{game.points} Points</>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Screen>
  );
}
