export type GameKind = "explorer" | "photo" | "trivia" | "team" | "spin";

export type Team = {
  id: string;
  name: string;
  short: string;
  color: string;
  ink: string;
  points: number;
  daily: number;
};

export type Person = {
  id: string;
  name: string;
  teamId: string;
  points: number;
  daily: number;
  role?: string;
};

export type Game = {
  id: string;
  title: string;
  subtitle: string;
  points: number;
  kind: GameKind;
  blurb: string;
};

export type TriviaQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
};

export type Clue = {
  id: string;
  prompt: string;
  answers: string[];
  points: number;
};

export type Task = {
  id: string;
  title: string;
  detail: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  when: string;
};

export type AgendaDay = {
  id: string;
  dateLabel: string;
  weekday: string;
  title: string;
};

export type AgendaItem = {
  id: string;
  dayId: string;
  time: string;
  title: string;
  place: string;
  detail: string;
};

export type Photo = {
  id: string;
  src: string;
  caption: string;
  category: "highlights" | "people" | "activities";
  people: string[];
  teamId?: string;
  aspect: "tall" | "wide" | "square";
};

export type Resource = {
  id: string;
  title: string;
  detail: string;
  items: string[];
};

export type ChatMessage = {
  id: string;
  teamId: string;
  author: string;
  body: string;
  image?: string;
  fileName?: string;
  at: string;
  participantId?: string;
};

export type Profile = {
  id: string;
  name: string;
  teamId: string;
  phone?: string;
  notifications: boolean;
};

export type Completion = {
  id: string;
  gameId: string;
  points: number;
  detail: string;
  at: string;
  teamId: string;
  synced: boolean;
};

export type PointEvent = {
  id: string;
  participantId: string;
  teamId: string;
  gameId: string;
  points: number;
  at: string;
};

export type ActivityScore = {
  gameId: string;
  teamId: string;
  points: number;
};
