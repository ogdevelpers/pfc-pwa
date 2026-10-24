import { Suspense } from "react";
import { GameScreen } from "@/components/games/game-screen";
import { games } from "@/lib/data";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.id }));
}

async function GameSlug({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <GameScreen slug={slug} />;
}

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="px-6 py-16 text-center font-serif text-2xl text-navy">Opening the challenge…</div>}>
      <GameSlug params={params} />
    </Suspense>
  );
}
