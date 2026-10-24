import { supabase } from "@/lib/supabase";
import type {
  ActivityScore,
  AgendaItem,
  Announcement,
  ChatMessage,
  Completion,
  Photo,
  PointEvent,
  Profile,
} from "@/lib/types";
import { compressImage, readAsDataUrl } from "@/lib/utils";

export type RemoteTeam = { id: string; points: number; daily: number };

export type RemotePerson = {
  id: string;
  name: string;
  teamId: string;
  points: number;
  daily: number;
};

export type RemoteSnapshot = {
  teams: RemoteTeam[];
  people: RemotePerson[];
  messages: ChatMessage[];
  photos: Photo[];
  announcements: Announcement[];
  agenda: AgendaItem[];
  activities: ActivityScore[];
  events: PointEvent[];
};

type Row = Record<string, unknown>;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function mapMessage(row: Row): ChatMessage {
  return {
    id: text(row.id),
    teamId: text(row.team_id),
    author: text(row.author, "Guest"),
    body: text(row.body),
    image: text(row.image) || undefined,
    at: text(row.created_at, new Date().toISOString()),
    participantId: text(row.participant_id) || undefined,
  };
}

const chatBucket = "chat-files";

function storageName(file: File) {
  const cleaned = file.name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  if (cleaned.includes(".")) return cleaned || "file";
  if (file.type === "image/jpeg") return `${cleaned || "photo"}.jpg`;
  if (file.type === "image/png") return `${cleaned || "photo"}.png`;
  if (file.type === "image/webp") return `${cleaned || "photo"}.webp`;
  if (file.type === "image/gif") return `${cleaned || "photo"}.gif`;
  return cleaned || "file";
}

async function uploadBlob(id: string, body: Blob, name: string, type: string) {
  if (!supabase) return "";
  const path = `${id}/${name}`;
  const { error } = await supabase.storage.from(chatBucket).upload(path, body, {
    contentType: type || "application/octet-stream",
    upsert: false,
  });
  if (error) return "";
  return supabase.storage.from(chatBucket).getPublicUrl(path).data.publicUrl;
}

export async function uploadChatFile(id: string, file: File) {
  if (!supabase) return "";
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    try {
      const dataUrl = await compressImage(file);
      const blob = await (await fetch(dataUrl)).blob();
      const stem = storageName(file).replace(/\.[^.]+$/, "");
      const uploaded = await uploadBlob(id, blob, `${stem || "photo"}.jpg`, "image/jpeg");
      if (uploaded) return uploaded;
    } catch {
      /* The original file is tried next. */
    }
  }
  return uploadBlob(id, file, storageName(file), file.type || "application/octet-stream");
}

export async function localAttachment(file: File) {
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    try {
      return await compressImage(file);
    } catch {
      /* Fall through to the raw file. */
    }
  }
  return readAsDataUrl(file);
}

export async function loadCompanion(): Promise<RemoteSnapshot> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const [teams, people, photos, announcements, agenda, activities, events] =
    await Promise.all([
      supabase.from("teams").select("id, points, daily_offset"),
      supabase.from("participants").select("id, name, team_id, points, daily_points"),
      supabase.from("photos").select("id, src, caption, category, people, team_id, aspect"),
      supabase.from("announcements").select("id, title, body, posted_label").order("sort"),
      supabase.from("itinerary_items").select("id, day_id, starts_at, title, place, detail, sort").order("sort"),
      supabase.from("activity_scores").select("game_id, team_id, points"),
      supabase.from("point_events").select("id, participant_id, team_id, game_id, points, created_at"),
    ]);

  const failed = [teams, people, announcements, agenda, activities, events].find((result) => result.error);
  if (failed?.error) throw failed.error;

  return {
    teams: ((teams.data ?? []) as Row[]).map((row) => ({
      id: text(row.id),
      points: num(row.points),
      daily: num(row.daily_offset),
    })),
    people: ((people.data ?? []) as Row[]).map((row) => ({
      id: text(row.id),
      name: text(row.name, "Guest"),
      teamId: text(row.team_id, "blue"),
      points: num(row.points),
      daily: num(row.daily_points),
    })),
    messages: [],
    photos: ((photos.error ? [] : photos.data ?? []) as Row[]).map((row) => {
      const category = text(row.category, "highlights");
      const aspect = text(row.aspect, "square");
      return {
        id: text(row.id),
        src: text(row.src),
        caption: text(row.caption),
        category: category === "people" || category === "activities" ? category : "highlights",
        people: Array.isArray(row.people) ? row.people.filter((person) => typeof person === "string") : [],
        teamId: text(row.team_id) || undefined,
        aspect: aspect === "tall" || aspect === "wide" ? aspect : "square",
      } satisfies Photo;
    }),
    announcements: ((announcements.data ?? []) as Row[]).map((row) => ({
      id: text(row.id),
      title: text(row.title),
      body: text(row.body),
      when: text(row.posted_label),
    })),
    agenda: ((agenda.data ?? []) as Row[]).map((row) => ({
      id: text(row.id),
      dayId: text(row.day_id),
      time: text(row.starts_at),
      title: text(row.title),
      place: text(row.place),
      detail: text(row.detail),
    })),
    activities: ((activities.data ?? []) as Row[]).map((row) => ({
      gameId: text(row.game_id),
      teamId: text(row.team_id),
      points: num(row.points),
    })),
    events: ((events.data ?? []) as Row[]).map((row) => ({
      id: text(row.id),
      participantId: text(row.participant_id),
      teamId: text(row.team_id),
      gameId: text(row.game_id),
      points: num(row.points),
      at: text(row.created_at, new Date().toISOString()),
    })),
  };
}

function missingFunction(error: { code?: string } | null) {
  return error?.code === "PGRST202";
}

async function readSquadMessages(teamId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("event_messages")
    .select("id, team_id, author, body, image, created_at, participant_id")
    .eq("team_id", teamId)
    .order("created_at");
  if (error) throw error;
  return ((data ?? []) as Row[]).map(mapMessage);
}

export async function loadTeamMessages(phone: string, teamId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("list_team_messages", { p_phone: phone });
  if (!error) return ((Array.isArray(data) ? data : []) as Row[]).map(mapMessage);
  if (!missingFunction(error)) throw error;
  return readSquadMessages(teamId);
}

export async function upsertParticipant(profile: Profile) {
  if (!supabase) return false;
  const { error } = await supabase.from("participants").upsert(
    { id: profile.id, name: profile.name, team_id: profile.teamId },
    { onConflict: "id" },
  );
  return !error;
}

export async function pushPointEvent(completion: Completion, participantId: string) {
  if (!supabase) return false;
  const { error } = await supabase.from("point_events").insert({
    id: completion.id,
    participant_id: participantId,
    team_id: completion.teamId,
    game_id: completion.gameId,
    points: completion.points,
    detail: completion.detail,
    created_at: completion.at,
  });
  if (!error || error.code === "23505") return true;
  return false;
}

export function shareableImage(image?: string) {
  return Boolean(image && (image.startsWith("http://") || image.startsWith("https://") || image.length < 120_000));
}

export async function pushMessage(message: ChatMessage, phone: string) {
  if (!supabase) return false;
  const image = shareableImage(message.image) ? message.image : null;
  const { data, error } = await supabase.rpc("post_team_message", {
    p_phone: phone,
    p_id: message.id,
    p_body: message.body,
    p_image: image,
    p_created_at: message.at,
  });
  if (!error) return data === true;
  if (!missingFunction(error)) return false;
  const inserted = await supabase.from("event_messages").insert({
    id: message.id,
    team_id: message.teamId,
    author: message.author,
    body: message.body,
    image,
    participant_id: message.participantId,
    created_at: message.at,
  });
  return !inserted.error || inserted.error.code === "23505";
}
