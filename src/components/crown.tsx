export function CrownMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden>
      <path fill="currentColor" d="M6 32 14 12l10 12L32 4l8 20 10-12 8 20Z" />
      <rect x="8" y="34" width="48" height="5" rx="1.5" fill="currentColor" />
    </svg>
  );
}
