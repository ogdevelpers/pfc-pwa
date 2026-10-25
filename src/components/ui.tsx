"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

export function Screen({
  title,
  back,
  children,
  footer,
}: {
  title?: string;
  back?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    document.title = title ? `${title} · PFC` : "PFC · Your Event Companion";
  }, [title]);

  return (
    <div className="flex min-h-full flex-col">
      {title ? <Header title={title} back={back} /> : null}
      <div className="flex-1">{children}</div>
      {footer ? <div className="sticky bottom-0 z-20">{footer}</div> : null}
    </div>
  );
}

export function Pills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="segmented flex gap-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "pressable min-w-0 flex-1 rounded-full px-2 py-2.5 text-xs font-semibold",
              active ? "bg-white text-navy shadow-card" : "text-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

