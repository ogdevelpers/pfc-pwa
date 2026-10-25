"use client";

import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";
import { useApp } from "@/lib/store";

export function BellButton() {
  const { unreadCount, openNotices } = useApp();
  return (
    <button
      type="button"
      onClick={openNotices}
      aria-label={unreadCount ? `${unreadCount} new announcements` : "Announcements"}
      className="relative grid h-10 w-10 place-items-center rounded-full bg-white/50 text-ink backdrop-blur-md"
    >
      <Bell size={20} />
      {unreadCount > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold" /> : null}
    </button>
  );
}

export function Header({ title, back }: { title: string; back?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-cream/75 pt-[env(safe-area-inset-top)] text-ink backdrop-blur-xl">
      <div className="relative flex h-14 items-center px-1">
        {back ? (
          <Link href={back} aria-label="Back" className="grid h-11 w-11 place-items-center">
            <ChevronLeft size={24} />
          </Link>
        ) : (
          <span className="w-11" />
        )}
        <h1 className="pointer-events-none absolute left-1/2 max-w-[62%] -translate-x-1/2 truncate text-base font-semibold">
          {title}
        </h1>
        <div className="ml-auto">
          <BellButton />
        </div>
      </div>
    </header>
  );
}
