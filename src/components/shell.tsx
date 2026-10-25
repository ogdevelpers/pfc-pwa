"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Sun, Gamepad2, Trophy, MessageCircle } from "lucide-react";
import { WelcomeModal } from "@/components/welcome-modal";
import { Sheet } from "@/components/sheet";
import { LoginScreen } from "@/components/login-screen";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Today", icon: Sun, match: (path: string) => path === "/" },
  { href: "/itinerary", label: "Schedule", icon: CalendarDays, match: (path: string) => path.startsWith("/itinerary") },
  { href: "/games", label: "Play", icon: Gamepad2, match: (path: string) => path.startsWith("/games") },
  { href: "/leaderboard", label: "Board", icon: Trophy, match: (path: string) => path === "/leaderboard" },
  { href: "/chat", label: "Chat", icon: MessageCircle, match: (path: string) => path === "/chat" },
];

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="dock relative z-30 mx-3 mb-[max(0.45rem,env(safe-area-inset-bottom))] mt-2 shrink-0 px-1 py-1.5">
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
                  "pressable flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold",
                  active ? "bg-navy/10 text-navy" : "text-muted",
                )}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={cn("transition-transform duration-200", active && "-translate-y-0.5 scale-110")}
                />
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
    <Sheet title="Announcements" onClose={closeNotices}>
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
    </Sheet>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const pathname = usePathname();
  const { signedIn, noticesOpen, toast } = useApp();
  const locked = noticesOpen || welcomeOpen || !signedIn;

  return (
    <div data-home={pathname === "/"} id="pfc-frame" className="relative flex h-full w-full max-w-[430px] flex-col shadow-[0_30px_80px_rgba(7,30,61,0.28)] [transform:translateZ(0)]">
      <main
        ref={mainRef}
        inert={!signedIn}
        aria-hidden={!signedIn}
        className={cn(
          "scroll-area min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4",
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
        <LoginScreen onSignedIn={() => { setWelcomeOpen(true); router.replace("/"); }} />
      )}
      {signedIn && welcomeOpen ? <WelcomeModal onClose={() => setWelcomeOpen(false)} /> : null}
      {signedIn && !welcomeOpen ? <NoticeSheet /> : null}
      {toast ? (
        <div
          role="status"
          className="toast-in pointer-events-none absolute left-4 right-4 top-[max(1rem,env(safe-area-inset-top))] z-40 rounded-2xl bg-navy px-4 py-3 text-center text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
