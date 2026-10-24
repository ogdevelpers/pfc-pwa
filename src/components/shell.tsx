"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Image as ImageIcon, LayoutGrid, User, X } from "lucide-react";
import { LoginScreen } from "@/components/login-screen";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays, match: (path: string) => path.startsWith("/itinerary") },
  { href: "/hub", label: "Hub", icon: LayoutGrid, match: (path: string) => path === "/hub" },
  { href: "/gallery", label: "Gallery", icon: ImageIcon, match: (path: string) => path.startsWith("/gallery") },
  { href: "/profile", label: "Profile", icon: User, match: (path: string) => path.startsWith("/profile") },
];

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="z-30 border-t border-line bg-white px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
      <ul className="grid grid-cols-5">
        {nav.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold",
                  active ? "text-navy" : "text-muted",
                )}
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ScrollReset({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/chat") return;
    target.current?.scrollTo(0, 0);
  }, [pathname, target]);
  return null;
}

function NoticeSheet() {
  const { noticesOpen, closeNotices, announcements } = useApp();
  if (!noticesOpen) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-navy/45">
      <button type="button" className="flex-1" aria-label="Close announcements" onClick={closeNotices} />
      <div className="max-h-[80%] overflow-y-auto rounded-t-[28px] bg-cream px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-navy">Announcements</h2>
          <button type="button" onClick={closeNotices} aria-label="Close" className="grid h-10 w-10 place-items-center">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          {announcements.map((item) => (
            <article key={item.id} className="card p-4">
              <p className="text-xs font-semibold text-gold-ink">{item.when}</p>
              <h3 className="mt-1 font-semibold text-navy">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
        <Link
          href="/event"
          onClick={closeNotices}
          className="mt-4 block rounded-full bg-navy py-3 text-center text-sm font-semibold text-white"
        >
          Open the event hub
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const { signedIn, noticesOpen, toast } = useApp();
  const locked = noticesOpen || !signedIn;

  return (
    <div id="pfc-frame" className="relative flex h-full w-full max-w-[430px] flex-col bg-cream shadow-[0_30px_80px_rgba(7,30,61,0.28)] [transform:translateZ(0)]">
      <main
        ref={mainRef}
        inert={!signedIn}
        aria-hidden={!signedIn}
        className={cn(
          "scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto",
          locked && "overflow-hidden",
          !signedIn && "invisible",
        )}
      >
        {children}
      </main>
      {signedIn ? (
        <Suspense fallback={<div className="h-16 border-t border-line bg-white" />}>
          <BottomNav />
          <ScrollReset target={mainRef} />
        </Suspense>
      ) : (
        <LoginScreen />
      )}
      {signedIn ? <NoticeSheet /> : null}
      {toast ? (
        <div
          role="status"
          className="pointer-events-none absolute left-4 right-4 top-[max(1rem,env(safe-area-inset-top))] z-40 rounded-2xl bg-navy px-4 py-3 text-center text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
