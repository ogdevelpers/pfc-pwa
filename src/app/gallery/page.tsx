"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Camera, Search, X } from "lucide-react";
import { Pills, Screen } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { Photo } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "highlights" | "people" | "activities";

export default function GalleryPage() {
  const { photos, profile } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Photo | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return photos.filter((photo) => {
      if (filter !== "all" && photo.category !== filter) return false;
      if (!needle) return true;
      const haystack = [photo.caption, photo.category, ...(photo.people ?? []), photo.teamId ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [filter, photos, query]);

  return (
    <Screen
      title="PicBot"
      back="/hub"
      footer={
        <div className="bg-gradient-to-t from-cream via-cream to-transparent px-4 pb-3 pt-6">
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setQuery(profile.name);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3.5 text-sm font-semibold text-white"
          >
            <Camera size={18} />
            Find my photos with PicBot
          </button>
        </div>
      }
    >
      <div className="space-y-4 px-4 py-4">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label className="relative flex-1">
            <span className="sr-only">Search event photos</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search event photos…"
              className="w-full rounded-full border border-line bg-white py-3 pl-9 pr-3 text-base outline-none focus:border-navy"
            />
          </label>
        </form>
        <Pills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "highlights", label: "Highlights" },
            { value: "people", label: "People" },
            { value: "activities", label: "Activities" },
          ]}
        />
        {visible.length === 0 ? (
          <div className="card px-4 py-10 text-center">
            <p className="font-serif text-2xl text-navy">Nothing matched</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Try a squad, a place, or a teammate. PicBot reads names, captions, and the kind of moment.
            </p>
          </div>
        ) : (
          <div className="columns-2 gap-2">
            {visible.map((photo) => (
              <button
                key={photo.id}
                type="button"
                aria-label={photo.caption}
                onClick={() => setOpen(photo)}
                className="mb-2 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left"
              >
                <span
                  className={cn(
                    "relative block w-full",
                    photo.aspect === "tall" && "aspect-[3/4]",
                    photo.aspect === "wide" && "aspect-[4/3]",
                    photo.aspect === "square" && "aspect-square",
                  )}
                >
                  <Image src={photo.src} alt={photo.caption} fill className="object-cover" sizes="200px" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy-deep text-white">
            <div className="flex items-center justify-between px-2 pt-[env(safe-area-inset-top)]">
              <button type="button" onClick={() => setOpen(null)} aria-label="Close photo" className="grid h-11 w-11 place-items-center">
                <X />
              </button>
              <p className="text-sm font-semibold">PicBot</p>
              <span className="w-11" />
            </div>
            <div className="relative min-h-0 flex-1">
              <Image src={open.src} alt={open.caption} fill className="object-contain" sizes="430px" />
            </div>
            <div className="space-y-2 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
              <h2 className="font-serif text-2xl">{open.caption}</h2>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize">{open.category}</span>
                {open.people.map((person) => (
                  <span key={person} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {person}
                  </span>
                ))}
              </div>
          </div>
        </div>
      ) : null}
    </Screen>
  );
}
