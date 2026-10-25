"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { Pills, Screen } from "@/components/ui";
import { games, teams } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn, teamById } from "@/lib/utils";

type Scope = "teams" | "people";
type Tab = "overall" | "daily" | "activities";

export default function LeaderboardPage() {
  const { profile, teamPoints, peopleScores, activityPoints } = useApp();
  const [scope, setScope] = useState<Scope>("teams");
  const [tab, setTab] = useState<Tab>("overall");
  const metric = tab === "daily" ? "daily" : "overall";

  const rankedTeams = [...teams]
    .map((team) => ({ team, points: teamPoints(team.id, metric) }))
    .sort((a, b) => b.points - a.points || a.team.name.localeCompare(b.team.name));
  const people = peopleScores(metric);
  const podium = [rankedTeams[1], rankedTeams[0], rankedTeams[2]];

  return (
    <Screen title="Leaderboard" back="/hub">
      <div className="stagger space-y-4 px-4 py-4">
        <section className="px-1 pb-2 pt-1"><p className="eyebrow">SIX SQUADS. ONE SPIRIT.</p><h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-ink">Every moment counts.</h2><p className="mt-2 text-sm leading-5 text-muted">Cheer on your squad and see where your shared adventures take you.</p></section>
        <Pills
          value={scope}
          onChange={(next) => {
            setScope(next);
            if (next === "people" && tab === "activities") setTab("overall");
          }}
          options={[
            { value: "teams", label: "Teams" },
            { value: "people", label: "Individuals" },
          ]}
        />
        <Pills
          value={tab}
          onChange={setTab}
          options={
            scope === "teams"
              ? [
                  { value: "overall", label: "Overall" },
                  { value: "daily", label: "Daily" },
                  { value: "activities", label: "Activities" },
                ]
              : [
                  { value: "overall", label: "Overall" },
                  { value: "daily", label: "Daily" },
                ]
          }
        />

        {tab !== "activities" && scope === "teams" ? (
          <>
            <div className="flex items-end justify-center gap-2 pt-2">
              {podium.map((entry, index) => {
                if (!entry) return null;
                const place = index === 0 ? 2 : index === 1 ? 1 : 3;
                return (
                  <article
                    key={entry.team.id}
                    className={cn("flex w-[31%] flex-col items-center rounded-3xl px-2 py-4 text-center", place === 1 && "-mt-3")}
                    style={{ background: entry.team.color, color: entry.team.ink, minHeight: place === 1 ? 176 : place === 2 ? 150 : 136 }}
                  >
                    {place === 1 ? <Crown size={22} /> : <span className="h-[22px]" />}
                    <p className="mt-1 font-serif text-4xl leading-none">{place}</p>
                    <p className="mt-2 text-xs font-semibold leading-4">{entry.team.name}</p>
                    <p className="mt-2 text-sm font-bold">{entry.points}</p>
                    <p className="text-[10px] opacity-80">Points</p>
                  </article>
                );
              })}
            </div>
            <div className="space-y-2">
              {rankedTeams.slice(3).map((entry, index) => (
                <div
                  key={entry.team.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-card",
                    entry.team.id === profile.teamId && "ring-2 ring-navy",
                  )}
                >
                  <span className="w-6 text-center font-serif text-lg text-navy">{index + 4}</span>
                  <span className="h-8 w-1.5 rounded-full" style={{ background: entry.team.color }} />
                  <span className="flex-1 font-semibold text-navy">{entry.team.name}</span>
                  <span className="text-sm text-muted">{entry.points} Points</span>
                </div>
              ))}
            </div>
            <p className="pt-2 text-center text-[11px] font-semibold tracking-[0.22em] text-muted">
              SIX SQUADS. ONE SPIRIT.
            </p>
          </>
        ) : null}

        {tab !== "activities" && scope === "people" ? (
          <div className="space-y-2">
            {people.map((person, index) => {
              const squad = teamById(person.teamId);
              return (
                <div
                  key={person.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-card",
                    person.you && "ring-2 ring-navy",
                  )}
                >
                  <span className="w-6 text-center font-serif text-lg text-navy">{index + 1}</span>
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-[10px] font-bold"
                    style={{ background: squad.color, color: squad.ink }}
                  >
                    {person.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-navy">
                      {person.name}
                      {person.you ? " (you)" : ""}
                    </span>
                    <span className="block text-xs text-muted">
                      {squad.name}
                      {person.role ? ` · ${person.role}` : ""}
                    </span>
                  </span>
                  <span className="text-sm text-muted">{person.points} pts</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {tab === "activities" ? (
          <div className="space-y-4">
            {games.map((game) => {
              const rows = teams
                .map((team) => ({ team, points: activityPoints(game.id, team.id) }))
                .sort((a, b) => b.points - a.points);
              const top = rows.slice(0, 3);
              if (!top.some((row) => row.team.id === profile.teamId)) {
                const mine = rows.find((row) => row.team.id === profile.teamId);
                if (mine) top.push(mine);
              }
              const max = Math.max(...rows.map((row) => row.points), 1);
              return (
                <section key={game.id} className="card p-4">
                  <h2 className="font-semibold text-navy">{game.title}</h2>
                  <div className="mt-3 space-y-3">
                    {top.map((row) => (
                      <div key={row.team.id}>
                        <div className="mb-1 flex justify-between text-xs font-semibold">
                          <span className="text-navy">{row.team.name}</span>
                          <span className="text-muted">{row.points}</span>
                        </div>
                        <div className="h-2 rounded-full bg-cream-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ width: `${(row.points / max) * 100}%`, background: row.team.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}
      </div>
    </Screen>
  );
}
