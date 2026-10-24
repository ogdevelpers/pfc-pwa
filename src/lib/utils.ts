import { teams } from "@/lib/data";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return letters || "PFC";
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minute} ${suffix}`;
}

export function formatDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "Today";
  }
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function isToday(iso: string, now = new Date()) {
  const date = new Date(iso);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function guestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Last 10 digits, so 9811100001 and +91 98111 00001 match the same guest. */
export function phoneKey(value: string) {
  const digits = phoneDigits(value);
  if (digits.length < 10) return "";
  return digits.slice(-10);
}

export function formatPhone(value: string) {
  const key = phoneKey(value);
  return key ? `${key.slice(0, 5)} ${key.slice(5)}` : value;
}

export function teamById(id: string) {
  return teams.find((team) => team.id === id) ?? teams[0];
}

export function countdown(now = new Date()) {
  const start = Date.UTC(2026, 10, 15);
  const end = Date.UTC(2026, 10, 17);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((start - today) / 86_400_000);

  if (today > end) {
    return { kicker: "The gathering has", value: "Wrapped", unit: "" };
  }
  if (today >= start) {
    return { kicker: "The gathering is", value: "Live", unit: "" };
  }
  if (days === 1) {
    return { kicker: "Event begins in", value: "01", unit: "Day" };
  }
  return {
    kicker: "Event begins in",
    value: String(days).padStart(2, "0"),
    unit: "Days",
  };
}

export function agendaDayFor(now = new Date()) {
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  if (month === 10 && day === 16) return "day-2";
  if (month === 10 && day >= 17) return "day-3";
  return "day-1";
}

export function seatFor(name: string) {
  const seed = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rooms = [204, 208, 214, 221, 305, 312];
  const seats = [4, 7, 8, 11, 12, 15];
  const tables = [2, 4, 6, 7, 9, 11];
  return {
    room: rooms[seed % rooms.length],
    coach: ["A", "B", "C"][seed % 3],
    seat: seats[seed % seats.length],
    dinnerTable: tables[seed % tables.length],
    galaTable: tables[(seed + 3) % tables.length],
    forumRow: ["A", "B", "C", "D"][seed % 4],
    forumSeat: (seed % 12) + 1,
  };
}

const imageExtensions = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;

export function isImageAttachment(value: string) {
  if (value.startsWith("data:image/")) return true;
  const path = value.split("?")[0] ?? value;
  return imageExtensions.test(path);
}

export function attachmentName(value: string, fileName?: string) {
  if (fileName) return fileName;
  if (value.startsWith("data:")) return isImageAttachment(value) ? "Photo" : "File";
  const path = decodeURIComponent((value.split("?")[0] ?? value).split("/").pop() || "File");
  return path || "File";
}

export function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 960 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that photo."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo."));
    };
    image.src = url;
  });
}
