"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Screen } from "@/components/ui";
import { facts, resources } from "@/lib/data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function EventPage() {
  const { announcements } = useApp();
  const [open, setOpen] = useState<string | null>(resources[0]?.id ?? null);

  return (
    <Screen title="Event Info" back="/">
      <div className="stagger space-y-6 px-4 py-4">
        <section>
          <p className="text-xs font-semibold tracking-wide text-gold-ink">THE GATHERING</p>
          <h2 className="font-serif text-3xl text-navy">People, partnership and progress.</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Three days on the Italian Riviera. The programme, the practical bits, and the notes worth reading before you pack.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2">
          {facts.map((fact) => (
            <article key={fact.label} className="card p-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted">{fact.label.toUpperCase()}</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-navy">{fact.value}</p>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold text-navy">Announcements</h3>
          {announcements.map((item) => (
            <article key={item.id} className="card p-4">
              <p className="text-xs font-semibold text-gold-ink">{item.when}</p>
              <h4 className="mt-1 font-semibold text-navy">{item.title}</h4>
              <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
            </article>
          ))}
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-navy">Resources</h3>
          {resources.map((resource) => {
            const expanded = open === resource.id;
            return (
              <article key={resource.id} className="card overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : resource.id)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">{resource.title}</span>
                    <span className="mt-1 block text-sm text-muted">{resource.detail}</span>
                  </span>
                  <ChevronDown className={cn("shrink-0 text-muted transition", expanded && "rotate-180")} size={18} />
                </button>
                {expanded ? (
                  <ul className="space-y-2 px-4 pb-4 text-sm leading-6">
                    {resource.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </Screen>
  );
}
