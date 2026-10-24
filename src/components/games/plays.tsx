"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { clues, photoShots, squadTasks, trivia } from "@/lib/data";
import { useApp } from "@/lib/store";
import type { Game } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TriviaPlay({ onComplete }: { onComplete: (points: number, detail: string) => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const question = trivia[index];
  const last = index === trivia.length - 1;

  function choose(option: number) {
    if (picked !== null) return;
    setPicked(option);
    if (option === question.answer) setCorrect((count) => count + 1);
  }

  function next() {
    if (picked === null) return;
    if (last) {
      onComplete(correct * 4, `${correct} of ${trivia.length} correct`);
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
  }

  return (
    <div className="card p-4">
      <p className="text-xs font-semibold tracking-wide text-gold-ink">
        QUESTION {index + 1} OF {trivia.length}
      </p>
      <h3 className="mt-2 font-serif text-2xl leading-tight text-navy">{question.prompt}</h3>
      <div className="mt-4 space-y-2">
        {question.options.map((option, optionIndex) => {
          const revealed = picked !== null;
          const isAnswer = optionIndex === question.answer;
          const isPick = optionIndex === picked;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(optionIndex)}
              className={cn(
                "w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold",
                !revealed && "border-line bg-cream",
                revealed && isAnswer && "border-emerald-600 bg-emerald-50 text-emerald-900",
                revealed && isPick && !isAnswer && "border-red-500 bg-red-50 text-red-800",
                revealed && !isPick && !isAnswer && "border-transparent bg-cream text-muted",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={picked === null}
        onClick={next}
        className="mt-4 w-full rounded-full bg-navy py-3 text-sm font-semibold text-white disabled:opacity-40"
      >
        {last ? "Save my score" : "Next question"}
      </button>
    </div>
  );
}

export function ExplorerPlay({ onComplete }: { onComplete: (points: number, detail: string) => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const [earned, setEarned] = useState<number[]>([]);
  const clue = clues[step];
  const last = step === clues.length - 1;

  function mark(points: number) {
    const next = [...earned, points];
    if (last) {
      const total = next.reduce((sum, value) => sum + value, 0);
      const solved = next.filter(Boolean).length;
      onComplete(total, `${solved} of ${clues.length} clues`);
      return;
    }
    setEarned(next);
    setStep((value) => value + 1);
    setDraft("");
    setNote("");
  }

  function check() {
    const guess = draft.trim().toLowerCase();
    if (clue.answers.includes(guess)) {
      setNote("That is the one.");
      mark(clue.points);
      return;
    }
    setNote("Not quite. Try another word, or skip this clue.");
  }

  return (
    <div className="card p-4">
      <p className="text-xs font-semibold tracking-wide text-gold-ink">
        CLUE {step + 1} OF {clues.length}
      </p>
      <h3 className="mt-2 font-serif text-2xl leading-tight text-navy">{clue.prompt}</h3>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          check();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Your answer"
          className="w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base outline-none focus:border-navy"
        />
        {note ? <p className="text-sm text-muted">{note}</p> : null}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => mark(0)} className="rounded-full bg-white py-3 text-sm font-semibold text-navy shadow-card">
            Skip
          </button>
          <button type="submit" className="rounded-full bg-navy py-3 text-sm font-semibold text-white">
            Check
          </button>
        </div>
      </form>
    </div>
  );
}

export function PhotoQuest({ onComplete }: { onComplete: (points: number, detail: string) => void }) {
  const { quest, toggleQuest } = useApp();
  const done = photoShots.filter((shot) => quest[shot.id]).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {done} of {photoShots.length} frames. Six points each.
      </p>
      {photoShots.map((shot) => {
        const on = Boolean(quest[shot.id]);
        return (
          <button
            key={shot.id}
            type="button"
            onClick={() => toggleQuest(shot.id)}
            aria-pressed={on}
            className="card flex w-full items-start gap-3 p-4 text-left"
          >
            <span
              className={cn(
                "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                on ? "border-navy bg-navy text-white" : "border-line bg-white",
              )}
            >
              {on ? <Check size={14} /> : null}
            </span>
            <span>
              <span className="block font-semibold text-navy">{shot.title}</span>
              <span className="mt-1 block text-sm leading-5 text-muted">{shot.detail}</span>
            </span>
          </button>
        );
      })}
      <button
        type="button"
        disabled={done === 0}
        onClick={() => onComplete(done * 6, `${done} of ${photoShots.length} frames`)}
        className="w-full rounded-full bg-navy py-3.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        Claim {done * 6} points
      </button>
    </div>
  );
}

export function TeamChallenge({ onComplete }: { onComplete: (points: number, detail: string) => void }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = squadTasks.filter((task) => done[task.id]).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Mark what your squad finished. Ten points each.</p>
      {squadTasks.map((task) => {
        const on = Boolean(done[task.id]);
        return (
          <button
            key={task.id}
            type="button"
            aria-pressed={on}
            onClick={() => setDone((current) => ({ ...current, [task.id]: !current[task.id] }))}
            className="card flex w-full items-start gap-3 p-4 text-left"
          >
            <span
              className={cn(
                "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                on ? "border-navy bg-navy text-white" : "border-line bg-white",
              )}
            >
              {on ? <Check size={14} /> : null}
            </span>
            <span>
              <span className="block font-semibold text-navy">{task.title}</span>
              <span className="mt-1 block text-sm leading-5 text-muted">{task.detail}</span>
            </span>
          </button>
        );
      })}
      <button
        type="button"
        disabled={count === 0}
        onClick={() => onComplete(count * 10, `${count} of ${squadTasks.length} done together`)}
        className="w-full rounded-full bg-navy py-3.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        Claim {count * 10} points
      </button>
    </div>
  );
}

const SEGMENTS = [
  { points: 10, color: "#0B2E5B" },
  { points: 5, color: "#F3E6C4" },
  { points: 20, color: "#2F6FED" },
  { points: 10, color: "#FFFFFF" },
  { points: 15, color: "#E15B5B" },
  { points: 5, color: "#2E9B62" },
  { points: 20, color: "#E2B93B" },
  { points: 10, color: "#7A5AF8" },
];

export function SpinPlay({ onComplete }: { onComplete: (points: number, detail: string) => void }) {
  const [spin, setSpin] = useState<{ points: number; rotation: number } | null>(null);
  const started = useRef<number | null>(null);
  const gradient = `conic-gradient(${SEGMENTS.map(
    (segment, index) => `${segment.color} ${index * 45}deg ${(index + 1) * 45}deg`,
  ).join(", ")})`;

  useEffect(() => {
    if (!spin) return;
    if (!started.current) started.current = Date.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const remain = reduce ? 0 : Math.max(0, 4200 - (Date.now() - started.current));
    const id = window.setTimeout(
      () => onComplete(spin.points, `The wheel landed on ${spin.points}`),
      remain,
    );
    return () => window.clearTimeout(id);
  }, [onComplete, spin]);

  function spinWheel() {
    if (spin) return;
    const index = Math.floor(Math.random() * SEGMENTS.length);
    const center = index * 45 + 22.5;
    setSpin({
      points: SEGMENTS[index].points,
      rotation: 360 * 6 + (360 - center),
    });
  }

  return (
    <div className="card flex flex-col items-center px-4 py-6">
      <div className="relative h-64 w-64">
        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-gold-ink" aria-hidden>
          <svg width="28" height="22" viewBox="0 0 28 22">
            <path d="M14 22 0 0h28Z" fill="#0B2E5B" />
          </svg>
        </span>
        <div
          className="spin-wheel absolute inset-3 rounded-full shadow-card"
          style={{
            background: gradient,
            transform: `rotate(${spin?.rotation ?? 0}deg)`,
            transition: spin ? "transform 4s cubic-bezier(0.12, 0.7, 0.05, 1)" : undefined,
          }}
        >
          {SEGMENTS.map((segment, index) => (
            <span
              key={`${segment.points}-${index}`}
              className="absolute left-1/2 top-1/2 text-xs font-bold"
              style={{
                color: segment.color === "#0B2E5B" || segment.color === "#2F6FED" || segment.color === "#E15B5B" || segment.color === "#2E9B62" || segment.color === "#7A5AF8" ? "#fff" : "#0B2E5B",
                transform: `rotate(${index * 45 + 22.5}deg) translateY(-78px) translateX(-50%)`,
              }}
            >
              {segment.points}
            </span>
          ))}
        </div>
        <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy font-serif text-sm tracking-widest text-gold">
          PFC
        </div>
      </div>
      <button
        type="button"
        disabled={Boolean(spin)}
        onClick={spinWheel}
        className="mt-6 w-full rounded-full bg-navy py-3.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {spin ? "Spinning…" : "Spin the wheel"}
      </button>
    </div>
  );
}

export function Play({ game, onComplete }: { game: Game; onComplete: (points: number, detail: string) => void }) {
  if (game.kind === "trivia") return <TriviaPlay onComplete={onComplete} />;
  if (game.kind === "explorer") return <ExplorerPlay onComplete={onComplete} />;
  if (game.kind === "photo") return <PhotoQuest onComplete={onComplete} />;
  if (game.kind === "team") return <TeamChallenge onComplete={onComplete} />;
  return <SpinPlay onComplete={onComplete} />;
}
