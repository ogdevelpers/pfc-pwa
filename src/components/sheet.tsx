"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export function Sheet({ title, eyebrow, className = "", children, onClose }: { title: string; eyebrow?: string; className?: string; children: React.ReactNode; onClose: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className={`detail-sheet ${className}`} aria-labelledby={titleId} onCancel={onClose} onClick={(event) => { if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); }}>
      <div className="sheet-handle" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 pb-5">
        <div className="min-w-0">{eyebrow ? <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.12em] text-muted">{eyebrow}</p> : null}<h2 id={titleId} className="text-2xl font-semibold tracking-tight">{title}</h2></div>
        <button type="button" onClick={onClose} aria-label="Close details" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink/5"><X size={19}/></button>
      </div>
      {children}
    </dialog>
  );
}
