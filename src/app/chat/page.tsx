"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImagePlus, Send, Smile } from "lucide-react";
import { Screen } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";
import { attachmentName, cn, formatDay, formatTime, initials, isImageAttachment, teamById } from "@/lib/utils";

const emojis = ["😀", "🎉", "👏", "🔥", "⚓", "🍋"];

function isMine(message: ChatMessage, profileId: string, profileName: string) {
  if (message.participantId) return message.participantId === profileId;
  return message.author === profileName;
}

export default function ChatPage() {
  const { profile, messagesFor, sendMessage, mode } = useApp();
  const teamId = profile.teamId;
  const squad = teamById(teamId);
  const [draft, setDraft] = useState("");
  const [emojisOpen, setEmojisOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messages = messagesFor(teamId);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const scroller = endRef.current?.closest("main");
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages.length, teamId]);

  async function submit(file?: File) {
    const body = draft.trim();
    if (!body && !file) return;
    setSending(true);
    await sendMessage(teamId, body, file);
    setDraft("");
    setEmojisOpen(false);
    setSending(false);
  }

  const groups: { day: string; items: ChatMessage[] }[] = [];
  for (const message of messages) {
    const day = formatDay(message.at);
    const last = groups.at(-1);
    if (!last || last.day !== day) groups.push({ day, items: [message] });
    else last.items.push(message);
  }

  return (
    <Screen
      title="Team Chat"
      back="/hub"
      footer={
        <form
          className="border-t border-line bg-cream/95 px-3 py-2 backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {emojisOpen ? (
            <div className="mb-2 flex gap-1">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="grid h-10 flex-1 place-items-center rounded-xl bg-white text-lg"
                  onClick={() => setDraft((value) => `${value}${emoji}`)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <button
              type="button"
              aria-label="Emoji"
              onClick={() => setEmojisOpen((open) => !open)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-navy"
            >
              <Smile size={20} />
            </button>
            <button
              type="button"
              aria-label="Add a file"
              disabled={sending}
              onClick={() => fileRef.current?.click()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-navy disabled:opacity-40"
            >
              <ImagePlus size={20} />
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                void submit(file);
              }}
            />
            <label className="sr-only" htmlFor="chat-draft">
              Message
            </label>
            <input
              id="chat-draft"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message…"
              className="min-h-11 flex-1 rounded-full border border-line bg-white px-4 text-base outline-none focus:border-navy"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Send"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-white disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      }
    >
      <div className="px-4 py-3">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: squad.color }} />
          <p className="text-sm font-semibold text-navy">{squad.short}</p>
        </div>
        <p className="pb-3 text-center text-[11px] font-semibold tracking-wide text-muted">
          {mode === "live" ? "Live across the gathering" : mode === "connecting" ? "Connecting" : "On this phone"}
        </p>
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.day} className="space-y-3">
              <p className="text-center text-[11px] font-semibold tracking-wide text-muted">{group.day}</p>
              {group.items.map((message) => {
                const mine = isMine(message, profile.id, profile.name);
                return (
                  <div key={message.id} className={cn("bubble-in flex items-end gap-2", mine && "flex-row-reverse")}>
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold"
                      style={{ background: squad.color, color: squad.ink }}
                    >
                      {initials(message.author)}
                    </span>
                    <div className={cn("max-w-[78%]", mine && "text-right")}>
                      <p className="mb-1 text-[11px] font-semibold text-muted">{mine ? "You" : message.author}</p>
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-2 text-left text-sm leading-5",
                          mine ? "rounded-br-md bg-navy text-white" : "rounded-bl-md bg-white text-ink shadow-card",
                        )}
                      >
                        {message.image && isImageAttachment(message.image) ? (
                          <a href={message.image} target="_blank" rel="noreferrer">
                            {/* User photos may be local data URLs, which the image optimizer cannot fetch. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={message.image}
                              alt={attachmentName(message.image, message.fileName)}
                              className="mb-2 max-h-48 rounded-xl object-cover"
                            />
                          </a>
                        ) : null}
                        {message.image && !isImageAttachment(message.image) ? (
                          <a
                            href={message.image}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              "mb-2 flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold",
                              mine ? "bg-white/15 text-white" : "bg-cream text-navy",
                            )}
                          >
                            <FileText size={16} className="shrink-0" />
                            <span className="truncate">{attachmentName(message.image, message.fileName)}</span>
                          </a>
                        ) : null}
                        {message.body ? <p className="whitespace-pre-wrap break-words">{message.body}</p> : null}
                        <p className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-muted")}>
                          {formatTime(message.at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </Screen>
  );
}
