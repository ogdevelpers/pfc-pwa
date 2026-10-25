"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Play } from "@/components/games/plays";
import { GameIcon } from "@/components/game-icon";
import { Screen } from "@/components/ui";
import { games } from "@/lib/data";
import { useApp } from "@/lib/store";

export function GameScreen({ slug }: { slug: string }) {
  const { completeGame, completionFor } = useApp();
  const game = games.find((item) => item.id === slug);
  const completion = completionFor(slug);
  const onComplete = useCallback(
    (points: number, detail: string) => completeGame(slug, points, detail),
    [completeGame, slug],
  );

  if (!game) {
    return (
      <Screen title="Games" back="/games">
        <div className="px-6 py-16 text-center">
          <p className="font-serif text-3xl text-navy">That challenge is not on the card.</p>
          <Link href="/games" className="mt-5 inline-block rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
            Back to games
          </Link>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title={game.title} back="/games">
      <div className="stagger space-y-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <GameIcon kind={game.kind} />
          <div>
            <h2 className="font-semibold text-navy">{game.subtitle}</h2>
            <p className="text-sm text-muted">Up to {game.points} points</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-ink">{game.blurb}</p>
        {completion ? (
          <div className="card bg-navy px-5 py-7 text-center text-white">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-gold">POINTS EARNED</p>
            <p className="mt-1 font-serif text-6xl">{completion.points}</p>
            <p className="mt-2 text-sm text-white/80">{completion.detail}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href="/games" className="rounded-full bg-white/10 py-3 text-sm font-semibold">
                All games
              </Link>
              <Link href="/leaderboard" className="rounded-full bg-white py-3 text-sm font-semibold text-navy">
                Leaderboard
              </Link>
            </div>
          </div>
        ) : (
          <Play game={game} onComplete={onComplete} />
        )}
      </div>
    </Screen>
  );
}
