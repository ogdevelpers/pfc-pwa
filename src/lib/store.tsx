"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  activityBase,
  agendaItems,
  announcements as seededAnnouncements,
  messages as seededMessages,
  people as seededPeople,
  photos as seededPhotos,
  teams,
} from "@/lib/data";
import {
  loadCompanion,
  loadTeamMessages,
  localAttachment,
  pushMessage,
  pushPointEvent,
  shareableImage,
  uploadChatFile,
  upsertParticipant,
  type RemoteSnapshot,
} from "@/lib/remote";
import { supabaseConfigured } from "@/lib/supabase";
import type {
  Announcement,
  ChatMessage,
  Completion,
  Photo,
  Profile,
} from "@/lib/types";
import { guestId, isToday, phoneKey } from "@/lib/utils";

const STORAGE_KEY = "pfc-companion-v1";

type Persisted = {
  version: 1;
  profile: Profile;
  seenWelcome: boolean;
  completions: Completion[];
  localMessages: ChatMessage[];
  readAnnouncementIds: string[];
  quest: Record<string, boolean>;
};

type LinkMode = "device" | "connecting" | "live" | "offline";

type AppContextValue = {
  remote: RemoteSnapshot | null;
  ready: boolean;
  mode: LinkMode;
  profile: Profile;
  seenWelcome: boolean;
  completions: Completion[];
  points: number;
  quest: Record<string, boolean>;
  noticesOpen: boolean;
  toast: string | null;
  notify: (message: string) => void;
  photos: Photo[];
  announcements: Announcement[];
  agenda: typeof agendaItems;
  unreadCount: number;
  openNotices: () => void;
  closeNotices: () => void;
  updateProfile: (patch: Partial<Pick<Profile, "notifications">>) => void;
  signIn: (guest: { id: string; name: string; teamId: string; phone: string }) => void;
  signOut: () => void;
  completeGame: (gameId: string, points: number, detail: string) => void;
  completionFor: (gameId: string) => Completion | undefined;
  sendMessage: (teamId: string, body: string, file?: File) => Promise<void>;
  messagesFor: (teamId: string) => ChatMessage[];
  teamPoints: (teamId: string, metric: "overall" | "daily") => number;
  activityPoints: (gameId: string, teamId: string) => number;
  peopleScores: (metric: "overall" | "daily") => Array<{
    id: string;
    name: string;
    teamId: string;
    points: number;
    role?: string;
    you?: boolean;
  }>;
  toggleQuest: (id: string) => void;
  reset: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function freshProfile(): Profile {
  return {
    id: "local-guest",
    name: "Alex Morgan",
    teamId: "blue",
    notifications: true,
  };
}

function freshState(): Persisted {
  return {
    version: 1,
    profile: freshProfile(),
    seenWelcome: false,
    completions: [],
    localMessages: [],
    readAnnouncementIds: [],
    quest: {},
  };
}

function sanitize(raw: unknown): Persisted | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Persisted;
  if (value.version !== 1 || !value.profile || typeof value.profile.name !== "string") return null;
  if (!teams.some((team) => team.id === value.profile.teamId)) value.profile.teamId = "blue";
  value.profile.notifications = value.profile.notifications !== false;
  const phone = phoneKey(typeof value.profile.phone === "string" ? value.profile.phone : "");
  value.profile.phone = phone || undefined;
  value.completions = Array.isArray(value.completions) ? value.completions : [];
  value.localMessages = Array.isArray(value.localMessages) ? value.localMessages : [];
  value.readAnnouncementIds = Array.isArray(value.readAnnouncementIds) ? value.readAnnouncementIds : [];
  value.quest = value.quest && typeof value.quest === "object" ? value.quest : {};
  value.seenWelcome = Boolean(value.seenWelcome);
  return value;
}

function mergeById<T extends { id: string }>(seed: T[], remote?: T[]) {
  if (!remote?.length) return seed;
  const map = new Map(seed.map((item) => [item.id, item]));
  for (const item of remote) map.set(item.id, { ...map.get(item.id), ...item });
  const extras = remote.filter((item) => !seed.some((itemSeed) => itemSeed.id === item.id));
  return [...seed.map((item) => map.get(item.id) ?? item), ...extras];
}

const serverPersisted = freshState();
const serverBoot = { hydrated: false, persisted: serverPersisted };
let boot = serverBoot;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  boot = { hydrated: true, persisted: readStorage() };
}

function emit() {
  for (const listener of listeners) listener();
}

function writeStorage(next: Persisted) {
  const payload = { ...next, localMessages: next.localMessages.slice(-200) };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    const slim = {
      ...payload,
      localMessages: payload.localMessages.map((message) =>
        message.image?.startsWith("data:") ? { ...message, image: undefined } : message,
      ),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      /* The device is full. The session still works. */
    }
  }
}

function readStorage(): Persisted {
  try {
    const saved = sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
    if (saved) return saved;
  } catch {
    /* Keep a fresh guest if storage cannot be read. */
  }
  return { ...freshState(), profile: { ...freshProfile(), id: guestId() } };
}

function subscribePersisted(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getBoot() {
  return boot;
}

function getServerBoot() {
  return serverBoot;
}

function updatePersisted(recipe: (current: Persisted) => Persisted) {
  const current = boot.persisted;
  const next = recipe(current);
  if (next === current) return;
  boot = { hydrated: true, persisted: next };
  writeStorage(next);
  emit();
}

function calcTeamPoints(
  state: Persisted,
  snapshot: RemoteSnapshot | null,
  teamId: string,
  metric: "overall" | "daily",
) {
  const seed = teams.find((team) => team.id === teamId);
  const remote = snapshot?.teams.find((team) => team.id === teamId);
  const base = metric === "overall" ? (remote?.points ?? seed?.points ?? 0) : (remote?.daily ?? seed?.daily ?? 0);
  const extra = state.completions
    .filter((completion) => !completion.synced && completion.teamId === teamId)
    .filter((completion) => metric === "overall" || isToday(completion.at))
    .reduce((sum, completion) => sum + completion.points, 0);
  const events =
    metric === "daily"
      ? (snapshot?.events ?? [])
          .filter((event) => event.teamId === teamId && isToday(event.at))
          .reduce((sum, event) => sum + event.points, 0)
      : 0;
  return base + extra + events;
}

function calcActivityPoints(state: Persisted, snapshot: RemoteSnapshot | null, gameId: string, teamId: string) {
  const seeded =
    snapshot?.activities.find((score) => score.gameId === gameId && score.teamId === teamId) ??
    activityBase.find((score) => score.gameId === gameId && score.teamId === teamId);
  const remoteExtra = (snapshot?.events ?? [])
    .filter((event) => event.gameId === gameId && event.teamId === teamId)
    .reduce((sum, event) => sum + event.points, 0);
  const localExtra = state.completions
    .filter((completion) => !completion.synced && completion.gameId === gameId && completion.teamId === teamId)
    .reduce((sum, completion) => sum + completion.points, 0);
  return (seeded?.points ?? 0) + remoteExtra + localExtra;
}

function calcPeopleScores(
  state: Persisted,
  snapshot: RemoteSnapshot | null,
  metric: "overall" | "daily",
): Array<{ id: string; name: string; teamId: string; points: number; role?: string; you?: boolean }> {
  const remotePeople = snapshot?.people.length ? snapshot.people : null;
  const base = (remotePeople ?? seededPeople).filter((person) => person.id !== state.profile.id);
  const remoteYou = remotePeople?.find((person) => person.id === state.profile.id);
  const yours = state.completions.filter((completion) => !completion.synced);
  const yourPoints =
    metric === "overall"
      ? (remoteYou?.points ?? 0) + yours.reduce((sum, completion) => sum + completion.points, 0)
      : (snapshot?.events ?? [])
          .filter((event) => event.participantId === state.profile.id && isToday(event.at))
          .reduce((sum, event) => sum + event.points, 0) +
        yours.filter((completion) => isToday(completion.at)).reduce((sum, completion) => sum + completion.points, 0);

  return [
    ...base.map((person) => ({
      id: person.id,
      name: person.name,
      teamId: person.teamId,
      points: metric === "overall" ? person.points : person.daily,
      role: "role" in person && typeof person.role === "string" ? person.role : undefined,
    })),
    {
      id: state.profile.id,
      name: state.profile.name,
      teamId: state.profile.teamId,
      points: yourPoints,
      you: true as const,
    },
  ].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
}

function calcMessages(state: Persisted, snapshot: RemoteSnapshot | null, teamId: string) {
  const remote = snapshot ? snapshot.messages.filter((message) => message.teamId === teamId) : [];
  const seed = seededMessages.filter((message) => message.teamId === teamId);
  const local = state.localMessages.filter((message) => message.teamId === teamId);
  const eventStart = Date.parse("2026-11-15T00:00:00Z");
  return dedupeMessages([...seed, ...remote, ...local]).sort((a, b) => {
    const aSent = Date.parse(a.at) < eventStart;
    const bSent = Date.parse(b.at) < eventStart;
    if (aSent !== bSent) return aSent ? 1 : -1;
    return a.at.localeCompare(b.at);
  });
}

function preferredImage(current?: string, incoming?: string) {
  const images = [incoming, current].filter((image): image is string => Boolean(image));
  return images.find((image) => image.startsWith("https://") || image.startsWith("http://")) ?? images[0];
}

function dedupeMessages(list: ChatMessage[]) {
  const map = new Map<string, ChatMessage>();
  for (const message of list) {
    const prev = map.get(message.id);
    if (!prev) {
      map.set(message.id, message);
      continue;
    }
    map.set(message.id, {
      ...prev,
      ...message,
      body: message.body || prev.body,
      image: preferredImage(prev.image, message.image),
      fileName: message.fileName || prev.fileName,
    });
  }
  return [...map.values()];
}

export function Providers({ children }: { children: React.ReactNode }) {
  const bootState = useSyncExternalStore(subscribePersisted, getBoot, getServerBoot);
  const ready = bootState.hydrated;
  const state = bootState.persisted;
  const [snapshot, setSnapshot] = useState<RemoteSnapshot | null>(null);
  const [mode, setMode] = useState<LinkMode>(supabaseConfigured ? "connecting" : "device");
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const syncing = useRef(false);
  const localMessagesRef = useRef(state.localMessages);
  localMessagesRef.current = state.localMessages;
  const squadMessagesRef = useRef<ChatMessage[] | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!ready || !supabaseConfigured) return;
    let cancel = false;
    loadCompanion()
      .then((data) => {
        if (cancel) return;
        setSnapshot({ ...data, messages: squadMessagesRef.current ?? data.messages });
        setMode("live");
      })
      .catch(() => {
        if (!cancel) setMode("offline");
      });
    return () => {
      cancel = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || !supabaseConfigured || !state.profile.phone) return;
    const phone = state.profile.phone;
    const teamId = state.profile.teamId;
    let cancel = false;

    const pull = async () => {
      try {
        let messages = await loadTeamMessages(phone, teamId);
        if (cancel) return;
        const pending = localMessagesRef.current.filter((message) => {
          if (message.teamId !== teamId) return false;
          const remote = messages.find((item) => item.id === message.id);
          if (!remote) return Boolean(message.body) || shareableImage(message.image);
          return Boolean(message.image) && !remote.image && shareableImage(message.image);
        });
        let posted = false;
        for (const message of pending) posted = (await pushMessage(message, phone)) || posted;
        if (posted) messages = await loadTeamMessages(phone, teamId);
        if (cancel) return;
        squadMessagesRef.current = messages;
        setSnapshot((current) => ({
          teams: [],
          people: [],
          photos: [],
          announcements: [],
          agenda: [],
          activities: [],
          events: [],
          ...current,
          messages,
        }));
        setMode("live");
      } catch {
        /* Keep the copy already on this phone. */
      }
    };

    void pull();
    const id = window.setInterval(() => void pull(), 4000);
    return () => {
      cancel = true;
      window.clearInterval(id);
    };
  }, [ready, state.profile.phone, state.profile.teamId]);

  useEffect(() => {
    if (!ready || !supabaseConfigured || !state.profile.phone) return;
    void upsertParticipant(state.profile);
  }, [ready, state.profile]);

  useEffect(() => {
    if (!ready || !supabaseConfigured || !state.profile.phone || syncing.current) return;
    const pending = state.completions.filter((completion) => !completion.synced);
    if (!pending.length) return;
    syncing.current = true;
    const profile = state.profile;
    void (async () => {
      try {
        await upsertParticipant(profile);
        const pushed: string[] = [];
        for (const completion of pending) {
          const ok = await pushPointEvent(completion, profile.id);
          if (ok) pushed.push(completion.id);
        }
        const data = await loadCompanion();
        setSnapshot({ ...data, messages: squadMessagesRef.current ?? data.messages });
        setMode("live");
        if (pushed.length) {
          updatePersisted((current) => ({
            ...current,
            completions: current.completions.map((item) =>
              pushed.includes(item.id) ? { ...item, synced: true } : item,
            ),
          }));
        }
      } catch {
        setMode("offline");
      } finally {
        syncing.current = false;
      }
    })();
  }, [ready, state.completions, state.profile]);

  const announcements = mergeById(seededAnnouncements, snapshot?.announcements);
  const agenda = mergeById(agendaItems, snapshot?.agenda);
  const photos = mergeById(seededPhotos, snapshot?.photos);

  const teamPoints = useCallback(
    (teamId: string, metric: "overall" | "daily") => calcTeamPoints(state, snapshot, teamId, metric),
    [snapshot, state],
  );

  const activityPoints = useCallback(
    (gameId: string, teamId: string) => calcActivityPoints(state, snapshot, gameId, teamId),
    [snapshot, state],
  );

  const peopleScores = useCallback(
    (metric: "overall" | "daily") => calcPeopleScores(state, snapshot, metric),
    [snapshot, state],
  );

  const messagesFor = useCallback(
    (teamId: string) => (teamId === state.profile.teamId ? calcMessages(state, snapshot, state.profile.teamId) : []),
    [snapshot, state],
  );

  const completeGame = useCallback(
    (gameId: string, points: number, detail: string) => {
      updatePersisted((current) => {
        if (current.completions.some((completion) => completion.gameId === gameId)) return current;
        return {
          ...current,
          completions: [
            ...current.completions,
            {
              id: `${current.profile.id}:${gameId}`,
              gameId,
              points,
              detail,
              at: new Date().toISOString(),
              teamId: current.profile.teamId,
              synced: false,
            },
          ],
        };
      });
      setToast(points > 0 ? `You earned ${points} points` : "Round saved");
    },
    [],
  );

  const sendMessage = useCallback(
    async (_teamId: string, body: string, file?: File) => {
      const id = guestId();
      let image: string | undefined;
      let fileName: string | undefined;
      let shared = true;
      if (file) {
        if (file.size > 15 * 1024 * 1024) {
          setToast("That file is too large to send.");
          return;
        }
        fileName = file.name || "File";
        image = (await uploadChatFile(id, file)) || undefined;
        if (!image) {
          try {
            image = await localAttachment(file);
          } catch {
            image = undefined;
          }
        }
        if (!image) {
          setToast("That file could not be attached.");
          return;
        }
        shared = shareableImage(image);
      }
      if (!body && !image) return;
      const message: ChatMessage = {
        id,
        teamId: state.profile.teamId,
        author: state.profile.name,
        body,
        image,
        fileName,
        at: new Date().toISOString(),
        participantId: state.profile.id,
      };
      updatePersisted((current) => ({
        ...current,
        localMessages: [...current.localMessages, { ...message, teamId: current.profile.teamId }],
      }));
      if (!supabaseConfigured || !state.profile.phone) return;
      if (!shared) {
        setToast(body ? "The words were sent. The file stayed on this phone." : "Saved on this phone. The file could not be shared yet.");
        if (!body) return;
      }
      const ok = await pushMessage(
        shared ? { ...message, teamId: state.profile.teamId } : { ...message, teamId: state.profile.teamId, image: undefined },
        state.profile.phone,
      );
      if (!ok) setToast("Saved on this phone. Live chat did not accept it.");
    },
    [state.profile.id, state.profile.name, state.profile.phone, state.profile.teamId],
  );

  const updateProfile = useCallback((patch: Partial<Pick<Profile, "notifications">>) => {
    updatePersisted((current) => ({ ...current, profile: { ...current.profile, ...patch } }));
  }, []);

  const signIn = useCallback((guest: { id: string; name: string; teamId: string; phone: string }) => {
    const phone = phoneKey(guest.phone);
    if (!phone || !guest.id || !teams.some((team) => team.id === guest.teamId)) return;
    updatePersisted((current) => {
      const same = current.profile.id === guest.id;
      return {
        ...current,
        seenWelcome: true,
        profile: {
          id: guest.id,
          name: guest.name.trim() || "Guest",
          teamId: guest.teamId,
          phone,
          notifications: current.profile.notifications !== false,
        },
        completions: same ? current.completions : [],
        localMessages: same ? current.localMessages : [],
        quest: same ? current.quest : {},
      };
    });
  }, []);

  const signOut = useCallback(() => {
    updatePersisted((current) => ({
      ...current,
      seenWelcome: false,
      profile: { ...current.profile, phone: undefined },
    }));
    setToast("Signed out");
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      remote: snapshot,
      ready,
      mode,
      profile: state.profile,
      seenWelcome: state.seenWelcome,
      completions: state.completions,
      points: state.completions.reduce((sum, completion) => sum + completion.points, 0),
      quest: state.quest,
      noticesOpen,
      toast,
      photos,
      announcements,
      agenda,
      unreadCount: state.profile.notifications
        ? announcements.filter((item) => !state.readAnnouncementIds.includes(item.id)).length
        : 0,
      openNotices: () => {
        setNoticesOpen(true);
        updatePersisted((current) => ({
          ...current,
          readAnnouncementIds: announcements.map((item) => item.id),
        }));
      },
      closeNotices: () => setNoticesOpen(false),
      notify: (message: string) => setToast(message),
      updateProfile,
      signIn,
      signOut,
      completeGame,
      completionFor: (gameId: string) => state.completions.find((completion) => completion.gameId === gameId),
      sendMessage,
      messagesFor,
      teamPoints,
      activityPoints,
      peopleScores,
      toggleQuest: (id: string) =>
        updatePersisted((current) => ({
          ...current,
          quest: { ...current.quest, [id]: !current.quest[id] },
        })),
      reset: () => {
        const next = { ...freshState(), profile: { ...freshProfile(), id: guestId() } };
        updatePersisted(() => next);
        setSnapshot(null);
        setMode(supabaseConfigured ? "connecting" : "device");
        setToast("This phone is reset");
      },
    }),
    [
      ready,
      mode,
      state,
      snapshot,
      noticesOpen,
      toast,
      photos,
      announcements,
      agenda,
      updateProfile,
      signIn,
      signOut,
      completeGame,
      sendMessage,
      messagesFor,
      teamPoints,
      activityPoints,
      peopleScores,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used within Providers");
  // Each screen subscribes itself so its hydration render uses the server snapshot.
  // The provider above may already be showing this phone's saved progress.
  const bootState = useSyncExternalStore(subscribePersisted, getBoot, getServerBoot);
  const state = bootState.persisted;
  const snapshot = value.remote;

  return {
    ...value,
    ready: bootState.hydrated,
    profile: state.profile,
    signedIn: Boolean(state.profile.phone),
    seenWelcome: state.seenWelcome,
    completions: state.completions,
    points: state.completions.reduce((sum, completion) => sum + completion.points, 0),
    quest: state.quest,
    unreadCount: state.profile.notifications
      ? value.announcements.filter((item) => !state.readAnnouncementIds.includes(item.id)).length
      : 0,
    completionFor: (gameId: string) => state.completions.find((completion) => completion.gameId === gameId),
    messagesFor: (teamId: string) =>
      teamId === state.profile.teamId ? calcMessages(state, snapshot, state.profile.teamId) : [],
    teamPoints: (teamId: string, metric: "overall" | "daily") => calcTeamPoints(state, snapshot, teamId, metric),
    activityPoints: (gameId: string, teamId: string) => calcActivityPoints(state, snapshot, gameId, teamId),
    peopleScores: (metric: "overall" | "daily") => calcPeopleScores(state, snapshot, metric),
  };
}
