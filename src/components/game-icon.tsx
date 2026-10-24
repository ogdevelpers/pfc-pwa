import { Camera, Compass, Gift, Lightbulb, Users } from "lucide-react";
import type { GameKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<GameKind, { bg: string; fg: string; icon: typeof Compass }> = {
  explorer: { bg: "#F8E7C4", fg: "#8A5A12", icon: Compass },
  photo: { bg: "#D7E6F8", fg: "#1C4E89", icon: Camera },
  trivia: { bg: "#F8EFBF", fg: "#8A6A10", icon: Lightbulb },
  team: { bg: "#D9E3F8", fg: "#243E78", icon: Users },
  spin: { bg: "#F8D6D2", fg: "#9C3B36", icon: Gift },
};

export function GameIcon({ kind, className }: { kind: GameKind; className?: string }) {
  const item = styles[kind];
  const Icon = item.icon;
  return (
    <span
      className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", className)}
      style={{ background: item.bg, color: item.fg }}
    >
      <Icon size={26} />
    </span>
  );
}
