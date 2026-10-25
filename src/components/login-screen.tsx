"use client";

import { useRef, useState } from "react";
import { CrownMark } from "@/components/crown";
import { useApp } from "@/lib/store";

export function LoginScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const { signIn } = useApp();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);


  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = String(new FormData(event.currentTarget).get("phone") ?? phone);
    setPhone(entered);
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: entered }),
      });
      const payload = (await response.json()) as {
        error?: string;
        id?: string;
        name?: string;
        teamId?: string;
        phone?: string;
      };
      if (!response.ok || !payload.id || !payload.name || !payload.teamId || !payload.phone) {
        setError(payload.error || "That number could not be checked.");
        return;
      }
      signIn({ id: payload.id, name: payload.name, teamId: payload.teamId, phone: payload.phone });
      onSignedIn();
    } catch {
      setError("The guest list did not answer. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="welcome-screen absolute inset-0 z-50 overflow-y-auto">
      <div className="relative z-10 flex min-h-full flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
        <CrownMark className="h-8 w-12 text-gold-ink" />
        <p className="eyebrow mt-5">THE PFC EXPERIENCE · 2026</p>
        <h1 className="mt-2 text-[3.2rem] font-semibold leading-[1.02] tracking-[-0.06em] text-ink">PFC<br />Gathering<span className="text-gold-ink">.</span></h1>
        <p className="mt-3 text-sm font-medium text-ink">Portofino · 15–17 Nov 2026</p>
        <p className="mt-4 self-start rounded-full border border-white/70 bg-white/55 px-3 py-2 text-[9px] font-semibold tracking-[0.17em] backdrop-blur-md">TOGETHER BEYOND BOUNDARIES</p>
        <form className="glass mt-auto p-5" onSubmit={(event) => void submit(event)}>
          <p className="mb-1 text-xl font-semibold tracking-tight text-ink">Your Riviera story starts here.</p>
          <p className="mb-5 text-sm text-muted">Three days. Six squads. One unforgettable gathering.</p>
          <label className="eyebrow" htmlFor="guest-phone">MOBILE NUMBER ON THE GUEST LIST</label>
          <div className="mt-2 flex items-center rounded-2xl border border-white/80 bg-white/85 px-4">
            <span className="mr-3 text-sm text-muted">+91</span>
            <input ref={phoneRef} id="guest-phone" name="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel-national" placeholder="98111 00001" aria-invalid={Boolean(error)} aria-describedby={error ? "login-error" : undefined} className="min-w-0 flex-1 bg-transparent py-4 text-base outline-none" />
          </div>
          {error ? <p id="login-error" role="alert" className="mt-3 text-sm leading-5 text-red-800">{error}</p> : null}
          <button type="submit" disabled={pending} className="primary-button mt-4 w-full py-4 text-sm font-semibold disabled:opacity-50">{pending ? "Checking the guest list…" : "Enter the gathering →"}</button>
          <p className="mt-4 text-center text-[11px] leading-4 text-muted">Your invitation to discover, connect and play.</p>
        </form>
      </div>
    </div>
  );
}
