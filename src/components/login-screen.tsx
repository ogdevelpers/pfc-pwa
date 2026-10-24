"use client";

import { useEffect, useRef, useState } from "react";
import { CrownMark } from "@/components/crown";
import { useApp } from "@/lib/store";

export function LoginScreen() {
  const { signIn } = useApp();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    phoneRef.current?.focus();
  }, []);

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
    } catch {
      setError("The guest list did not answer. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-cream">
      <div className="flex flex-1 flex-col justify-center px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
        <CrownMark className="h-8 w-14 text-gold-ink" />
        <p className="mt-6 font-serif text-4xl tracking-[0.18em] text-navy">PFC</p>
        <h1 className="mt-2 font-serif text-3xl text-navy">Your event companion</h1>
        <p className="mt-3 max-w-[18rem] text-sm leading-6 text-muted">
          Sign in with the mobile number on the guest list. Games, chat, and the schedule open after that.
        </p>
        <form className="mt-8" onSubmit={(event) => void submit(event)}>
          <label className="text-xs font-semibold tracking-wide text-muted" htmlFor="guest-phone">
            MOBILE NUMBER
          </label>
          <input
            ref={phoneRef}
            id="guest-phone"
            name="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="98111 00001"
            className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base outline-none focus:border-navy"
          />
          {error ? <p className="mt-3 text-sm leading-5 text-red-700">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-full bg-navy py-3.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {pending ? "Checking the guest list…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
