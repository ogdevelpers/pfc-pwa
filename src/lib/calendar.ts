import type { AgendaItem } from "@/lib/types";

function escape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Export local event times with the destination timezone, independent of the guest's device. */
export function downloadCalendar(items: AgendaItem[]) {
  const events = items.map((item) => {
    const day = { "day-1": "20261115", "day-2": "20261116", "day-3": "20261117" }[item.dayId];
    const match = /^(\d{1,2}):(\d{2})/.exec(item.time);
    if (!day || !match) return null;
    return ["BEGIN:VEVENT", `UID:${escape(item.id)}@pfc-gathering`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`, `DTSTART;TZID=Europe/Rome:${day}T${match[1].padStart(2,"0")}${match[2]}00`, `SUMMARY:${escape(item.title)}`, `LOCATION:${escape(item.place)}`, `DESCRIPTION:${escape(item.detail)}`, "END:VEVENT"].join("\r\n");
  }).filter(Boolean);
  if (!events.length) return false;
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PFC//Gathering Companion//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "pfc-gathering.ics";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
