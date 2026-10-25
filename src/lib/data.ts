import type {
  ActivityScore,
  AgendaDay,
  AgendaItem,
  Announcement,
  ChatMessage,
  Clue,
  Game,
  Person,
  Photo,
  Resource,
  Task,
  Team,
  TriviaQuestion,
} from "@/lib/types";

const shot = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;

const at = (time: string) => `2026-11-15T${time}:00`;

export const eventMeta = {
  name: "PFC Gathering",
  place: "Portofino, Italian Riviera",
  venue: "Hotel Splendido",
  dates: "15 – 17 Nov 2026",
  motto: "Together Beyond Boundaries",
  welcome: "A journey of people, partnership and progress.",
  wifi: "SplendidoGuest",
  wifiPassword: "portofino2026",
  hero: shot("photo-1516483638261-f4dbaf036963", 1400),
};

export const teams: Team[] = [
  { id: "blue", name: "Blue Squad", short: "Team in Blue", color: "#2F6FED", ink: "#FFFFFF", points: 290, daily: 70 },
  { id: "yellow", name: "Yellow Squad", short: "Team in Yellow", color: "#E2B93B", ink: "#0B2E5B", points: 320, daily: 90 },
  { id: "red", name: "Red Squad", short: "Team in Red", color: "#E15B5B", ink: "#FFFFFF", points: 270, daily: 55 },
  { id: "green", name: "Green Squad", short: "Team in Green", color: "#2E9B62", ink: "#FFFFFF", points: 240, daily: 40 },
  { id: "purple", name: "Purple Squad", short: "Team in Purple", color: "#7A5AF8", ink: "#FFFFFF", points: 220, daily: 35 },
  { id: "orange", name: "Orange Squad", short: "Team in Orange", color: "#E8873A", ink: "#FFFFFF", points: 210, daily: 30 },
];

export const people: Person[] = [
  { id: "p-leila", name: "Leila Rossi", teamId: "yellow", points: 110, daily: 28 },
  { id: "p-marco", name: "Marco Bianchi", teamId: "yellow", points: 102, daily: 24 },
  { id: "p-elena", name: "Elena Voss", teamId: "yellow", points: 92, daily: 20 },
  { id: "p-sara", name: "Sara Klein", teamId: "red", points: 97, daily: 22 },
  { id: "p-rohan", name: "Rohan Mehta", teamId: "blue", points: 96, daily: 26, role: "Team Captain" },
  { id: "p-priya", name: "Priya Shah", teamId: "blue", points: 88, daily: 18 },
  { id: "p-noah", name: "Noah Adeyemi", teamId: "green", points: 84, daily: 16 },
  { id: "p-ines", name: "Ines Costa", teamId: "purple", points: 79, daily: 14 },
  { id: "p-omar", name: "Omar Haddad", teamId: "orange", points: 76, daily: 12 },
  { id: "p-amit", name: "Amit Verma", teamId: "blue", points: 74, daily: 14 },
  { id: "p-hana", name: "Hana Ito", teamId: "red", points: 71, daily: 18 },
  { id: "p-maya", name: "Maya Berg", teamId: "green", points: 68, daily: 12 },
  { id: "p-luis", name: "Luis Ortega", teamId: "purple", points: 66, daily: 10 },
  { id: "p-chiara", name: "Chiara Conti", teamId: "orange", points: 64, daily: 11 },
];

export const games: Game[] = [
  {
    id: "riviera-explorers",
    title: "Riviera Explorers",
    subtitle: "Solve. Explore. Score!",
    points: 50,
    kind: "explorer",
    blurb: "Three clues around the weekend. Solve them with your squad and bank the points.",
  },
  {
    id: "photo-quest",
    title: "Photo Quest",
    subtitle: "Capture the Moment!",
    points: 30,
    kind: "photo",
    blurb: "Five frames from the coast. Check each one off as you find it.",
  },
  {
    id: "trivia-challenge",
    title: "Trivia Challenge",
    subtitle: "Test Your Knowledge!",
    points: 20,
    kind: "trivia",
    blurb: "Five questions about the gathering. Four points for every one you get right.",
  },
  {
    id: "team-challenges",
    title: "Team Challenges",
    subtitle: "Play Together!",
    points: 40,
    kind: "team",
    blurb: "Four things only a squad can finish. Ten points for each one you complete.",
  },
  {
    id: "spin-and-win",
    title: "Spin & Win",
    subtitle: "Try Your Luck!",
    points: 20,
    kind: "spin",
    blurb: "One spin on the terrace wheel. Whatever it lands on is yours.",
  },
];

export const trivia: TriviaQuestion[] = [
  {
    id: "q1",
    prompt: "When does the PFC gathering begin?",
    options: ["15 November 2026", "1 December 2026", "15 October 2026", "20 November 2026"],
    answer: 0,
  },
  {
    id: "q2",
    prompt: "Where are we gathering?",
    options: ["Lake Como", "Portofino and the Italian Riviera", "Nice", "Santorini"],
    answer: 1,
  },
  {
    id: "q3",
    prompt: "What is the gathering motto?",
    options: ["Further, Faster, Together", "Together Beyond Boundaries", "One Team, One Dream", "Sail Beyond Limits"],
    answer: 1,
  },
  {
    id: "q4",
    prompt: "How many squads are in the running?",
    options: ["4", "5", "6", "8"],
    answer: 2,
  },
  {
    id: "q5",
    prompt: "PFC asks guests to travel in the spirit of…",
    options: ["Speed, scale and certainty", "Rest, ritual and reward", "People, partnership and progress", "Play, prizes and photos"],
    answer: 2,
  },
];

export const clues: Clue[] = [
  {
    id: "c1",
    prompt: "The colour of the sea on a clear Portofino morning, and the squad cheered from the lobby flags.",
    answers: ["blue"],
    points: 20,
  },
  {
    id: "c2",
    prompt: "The gathering runs across this many November days.",
    answers: ["3", "three"],
    points: 15,
  },
  {
    id: "c3",
    prompt: "Finish the postcard line: Together Beyond ____.",
    answers: ["boundaries", "boundary"],
    points: 15,
  },
];

export const photoShots: Task[] = [
  { id: "harbour", title: "The harbour", detail: "Boats, water, or the view down to the quay." },
  { id: "squad", title: "Your full squad", detail: "Everyone in frame, even if someone is mid-laugh." },
  { id: "gold", title: "Something gold", detail: "Light, a lemon, a frame, a glass." },
  { id: "toast", title: "A toast", detail: "A table, a glass, a welcome." },
  { id: "above", title: "The view from above", detail: "A terrace, a window, or the hill over the bay." },
];

export const squadTasks: Task[] = [
  { id: "photo", title: "Squad photo at the harbour", detail: "One frame, the whole group." },
  { id: "story", title: "Learn a teammate’s story", detail: "Something you did not know before this weekend." },
  { id: "cheer", title: "Cheer another squad in chat", detail: "Name them, and mean it." },
  { id: "arrive", title: "Arrive together", detail: "Lobby, steps, or salon. Together counts." },
];

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Welcome dinner moves to the terrace",
    body: "Sunday’s welcome dinner is on the terrace at 7:30 PM. The breeze comes up after sunset, so bring a light layer.",
    when: "14 Nov",
  },
  {
    id: "a2",
    title: "Coaches leave at 8:30 AM sharp",
    body: "Airport transfers depart with your named coach. Seat numbers live under My Seat. The village steps are easier if you keep your hands free.",
    when: "14 Nov",
  },
  {
    id: "a3",
    title: "Gala colour is your squad colour",
    body: "Monday’s gala is cocktail dress, with a touch of your squad colour. A scarf, a pocket square, or a pair of shoes is enough.",
    when: "13 Nov",
  },
  {
    id: "a4",
    title: "PicBot is open",
    body: "Event photos are landing through the weekend. Search your name in PicBot to find the frames you are in.",
    when: "13 Nov",
  },
  {
    id: "a5",
    title: "The board locks at noon on Tuesday",
    body: "Scores freeze at 12:00 on 17 November, just before awards. Anything earned after that still counts as a memory.",
    when: "12 Nov",
  },
];

export const agendaDays: AgendaDay[] = [
  { id: "day-1", dateLabel: "15 Nov", weekday: "Sunday", title: "Arrive and welcome" },
  { id: "day-2", dateLabel: "16 Nov", weekday: "Monday", title: "Discover and play" },
  { id: "day-3", dateLabel: "17 Nov", weekday: "Tuesday", title: "Finale" },
];

export const agendaItems: AgendaItem[] = [
  { id: "d1-1", dayId: "day-1", time: "08:30", title: "Airport welcome", place: "Genoa airport desk", detail: "Look for the navy PFC flags. The desk has water, name badges, and your coach letter." },
  { id: "d1-2", dayId: "day-1", time: "09:00", title: "Coach to Portofino", place: "Your named coach", detail: "Seats are printed on My Seat. The drive hugs the coast, so sit back for the first view." },
  { id: "d1-3", dayId: "day-1", time: "12:30", title: "Harbour lunch", place: "The quay", detail: "Sit with your squad. This is the easiest hour to learn two names you do not know yet." },
  { id: "d1-4", dayId: "day-1", time: "15:00", title: "Check-in", place: "Hotel Splendido", detail: "Keys, wifi, and a paper map of the village are at the desk. Rooms are ready from three." },
  { id: "d1-5", dayId: "day-1", time: "16:00", title: "Welcome briefing", place: "The library", detail: "The weekend, the games, and how points find their way to the board." },
  { id: "d1-6", dayId: "day-1", time: "17:30", title: "Riviera Explorers opens", place: "Lobby desk", detail: "Pick up the first clue card. You can also solve all three inside the app." },
  { id: "d1-7", dayId: "day-1", time: "19:30", title: "Welcome dinner", place: "Terrace", detail: "Team colours are welcome. Speeches are short. The view does the rest." },
  { id: "d2-1", dayId: "day-2", time: "08:00", title: "Breakfast", place: "Orangery", detail: "A long table, good coffee, and the day’s card at every seat." },
  { id: "d2-2", dayId: "day-2", time: "09:30", title: "Photo Quest", place: "The coast", detail: "Five frames. The village is the set. Be back before trivia." },
  { id: "d2-3", dayId: "day-2", time: "11:00", title: "Trivia Challenge", place: "The salon", detail: "Five questions, no phones on the table except this one, and a pencil if you want one." },
  { id: "d2-4", dayId: "day-2", time: "13:00", title: "Lunch, your own pace", place: "The village", detail: "Recommendations are at the desk. Keep the afternoon start in sight." },
  { id: "d2-5", dayId: "day-2", time: "15:30", title: "Team Challenges", place: "Harbour steps", detail: "Meet as a full squad. The tasks are short. The coordination is the point." },
  { id: "d2-6", dayId: "day-2", time: "18:00", title: "Spin & Win", place: "Terrace", detail: "One spin each. Watch the board move before dinner." },
  { id: "d2-7", dayId: "day-2", time: "20:00", title: "Gala dinner", place: "Harbour tables", detail: "Awards are tomorrow. Tonight is for the table and a touch of squad colour." },
  { id: "d3-1", dayId: "day-3", time: "08:00", title: "Breakfast and checkout", place: "Orangery", detail: "Bags can wait with the desk. Keep your badge for the forum." },
  { id: "d3-2", dayId: "day-3", time: "09:30", title: "Partnership forum", place: "The salon", detail: "Your row and seat are on My Seat. The conversation is the programme." },
  { id: "d3-3", dayId: "day-3", time: "12:00", title: "Leaderboard locks", place: "Everywhere", detail: "Final scores freeze. Late points still make a good story." },
  { id: "d3-4", dayId: "day-3", time: "12:30", title: "Awards and farewell lunch", place: "Terrace", detail: "Squad prizes, a few individual mentions, and lunch in the sun if the sun agrees." },
  { id: "d3-5", dayId: "day-3", time: "14:30", title: "Coaches to Genoa", place: "Hotel drive", detail: "Same coach letter as the way in. Safe travels." },
];

export const resources: Resource[] = [
  {
    id: "packing",
    title: "Packing list",
    detail: "The coast is mild in November. Layers beat a heavy coat.",
    items: [
      "Light layers for the water and the hill",
      "Shoes you can walk village steps in",
      "A touch of your squad colour for the gala",
      "A phone with room for photos",
      "A refillable bottle",
      "Passport or ID for hotel check-in",
    ],
  },
  {
    id: "around",
    title: "Getting around",
    detail: "Coaches are the transfer. The village itself is on foot.",
    items: [
      "Coaches leave on the minute. The letter is on My Seat.",
      "Hotel Splendido sits above the bay. The walk down is kind. The walk up is honest.",
      "Ask the desk about the boat if you have a free hour.",
      "Taxis are scarce at gala time. Plan to walk with your squad.",
    ],
  },
  {
    id: "contacts",
    title: "Contacts",
    detail: "Save these before you lose signal on the coast road.",
    items: [
      "Event desk +39 010 555 0190",
      "Hotel Splendido +39 0185 267 801",
      "Duty manager Giulia Ferro",
      "Meeting point: hotel lobby, under the PFC flags",
    ],
  },
  {
    id: "dress",
    title: "Dress code",
    detail: "Smart enough for dinner, easy enough for steps.",
    items: [
      "Days: Mediterranean smart casual",
      "Gala: cocktail, with a touch of squad colour",
      "Forum: relaxed tailoring",
      "A light layer lives in every good plan",
    ],
  },
];

export const photos: Photo[] = [
  { id: "ph1", src: shot("photo-1516483638261-f4dbaf036963"), caption: "First light over the Riviera", category: "highlights", people: [], aspect: "tall" },
  { id: "ph2", src: shot("photo-1533105079780-92b9be482077"), caption: "The coast waking up", category: "highlights", people: [], aspect: "wide" },
  { id: "ph3", src: shot("photo-1529156069898-49953e39b3ac"), caption: "Blue Squad before the briefing", category: "people", people: ["Alex Morgan", "Rohan Mehta", "Priya Shah"], teamId: "blue", aspect: "square" },
  { id: "ph4", src: shot("photo-1528605248644-14dd04022da1"), caption: "A long lunch on the quay", category: "people", people: ["Leila Rossi", "Marco Bianchi", "Elena Voss"], teamId: "yellow", aspect: "wide" },
  { id: "ph5", src: shot("photo-1519671482749-fd09be7ccebf"), caption: "Welcome drinks on the terrace", category: "highlights", people: ["Alex Morgan", "Amit Verma"], teamId: "blue", aspect: "tall" },
  { id: "ph6", src: shot("photo-1492684223066-81342ee5ff30"), caption: "Gala lights after sunset", category: "activities", people: [], aspect: "square" },
  { id: "ph7", src: shot("photo-1511795409834-ef04bbd61622"), caption: "A toast before the forum", category: "activities", people: ["Sara Klein", "Hana Ito", "Alex Morgan"], teamId: "red", aspect: "tall" },
  { id: "ph8", src: shot("photo-1567899378494-47b22a2ae96a"), caption: "The afternoon boat", category: "activities", people: ["Omar Haddad", "Chiara Conti"], teamId: "orange", aspect: "wide" },
  { id: "ph9", src: shot("photo-1539635278303-d4002c07eae3"), caption: "Green Squad on the steps", category: "people", people: ["Noah Adeyemi", "Maya Berg"], teamId: "green", aspect: "tall" },
  { id: "ph10", src: shot("photo-1527631746610-bca00a040d60"), caption: "Finding the view from above", category: "activities", people: ["Ines Costa", "Luis Ortega"], teamId: "purple", aspect: "square" },
  { id: "ph11", src: shot("photo-1414235077428-338989a2e8c0"), caption: "Saturday’s table", category: "highlights", people: ["Priya Shah", "Rohan Mehta"], teamId: "blue", aspect: "wide" },
  { id: "ph12", src: shot("photo-1559339352-11d035aa65de"), caption: "Lunch in the village", category: "activities", people: ["Alex Morgan", "Priya Shah"], teamId: "blue", aspect: "tall" },
  { id: "ph13", src: shot("photo-1507525428034-b723cf961d3e"), caption: "A quiet stretch of water", category: "highlights", people: [], aspect: "wide" },
  { id: "ph14", src: shot("photo-1476514525535-07fb3b4ae5f1"), caption: "Between sessions", category: "activities", people: ["Marco Bianchi"], teamId: "yellow", aspect: "tall" },
];

export const messages: ChatMessage[] = [
  { id: "m-blue-1", teamId: "blue", author: "Rohan Mehta", body: "Good morning team! Ready for today’s challenge?", at: at("08:15") },
  { id: "m-blue-2", teamId: "blue", author: "Priya Shah", body: "See you all at the lobby. Don’t forget your caps.", at: at("08:31") },
  { id: "m-blue-3", teamId: "blue", author: "Amit Verma", body: "Excited for the harbour walk.", at: at("08:34") },
  { id: "m-blue-4", teamId: "blue", author: "Rohan Mehta", body: "First clue is by the lemon trees. We finish together.", at: at("08:41") },
  { id: "m-yellow-1", teamId: "yellow", author: "Leila Rossi", body: "Yellow is already at breakfast. The terrace light is perfect.", at: at("08:12") },
  { id: "m-yellow-2", teamId: "yellow", author: "Marco Bianchi", body: "Save a table if you come up late. We started the photo list.", at: at("08:20") },
  { id: "m-red-1", teamId: "red", author: "Sara Klein", body: "Red squad, lobby at 8:40. We walk down together.", at: at("08:05") },
  { id: "m-red-2", teamId: "red", author: "Hana Ito", body: "I have spare pencils for trivia if you want one.", at: at("08:18") },
  { id: "m-green-1", teamId: "green", author: "Noah Adeyemi", body: "Green is walking up from the harbour. Leave the fast ones a view to catch.", at: at("08:22") },
  { id: "m-green-2", teamId: "green", author: "Maya Berg", body: "Caps are in my tote if you forgot yours.", at: at("08:29") },
  { id: "m-purple-1", teamId: "purple", author: "Ines Costa", body: "Purple, wear shoes you trust. The steps are steep and worth it.", at: at("08:16") },
  { id: "m-purple-2", teamId: "purple", author: "Luis Ortega", body: "I will be at the lemon trees five minutes early.", at: at("08:27") },
  { id: "m-orange-1", teamId: "orange", author: "Omar Haddad", body: "Orange will take the early boat if the desk confirms it.", at: at("08:11") },
  { id: "m-orange-2", teamId: "orange", author: "Chiara Conti", body: "See you at the forum doors if we split this afternoon.", at: at("08:27") },
];

export const activityBase: ActivityScore[] = [
  { gameId: "riviera-explorers", teamId: "yellow", points: 50 },
  { gameId: "riviera-explorers", teamId: "blue", points: 40 },
  { gameId: "riviera-explorers", teamId: "red", points: 30 },
  { gameId: "riviera-explorers", teamId: "green", points: 20 },
  { gameId: "riviera-explorers", teamId: "purple", points: 20 },
  { gameId: "riviera-explorers", teamId: "orange", points: 10 },
  { gameId: "photo-quest", teamId: "yellow", points: 80 },
  { gameId: "photo-quest", teamId: "blue", points: 60 },
  { gameId: "photo-quest", teamId: "red", points: 50 },
  { gameId: "photo-quest", teamId: "green", points: 40 },
  { gameId: "photo-quest", teamId: "purple", points: 30 },
  { gameId: "photo-quest", teamId: "orange", points: 30 },
  { gameId: "trivia-challenge", teamId: "yellow", points: 70 },
  { gameId: "trivia-challenge", teamId: "blue", points: 60 },
  { gameId: "trivia-challenge", teamId: "red", points: 40 },
  { gameId: "trivia-challenge", teamId: "green", points: 50 },
  { gameId: "trivia-challenge", teamId: "purple", points: 30 },
  { gameId: "trivia-challenge", teamId: "orange", points: 20 },
  { gameId: "team-challenges", teamId: "yellow", points: 80 },
  { gameId: "team-challenges", teamId: "blue", points: 70 },
  { gameId: "team-challenges", teamId: "red", points: 80 },
  { gameId: "team-challenges", teamId: "green", points: 60 },
  { gameId: "team-challenges", teamId: "purple", points: 50 },
  { gameId: "team-challenges", teamId: "orange", points: 40 },
  { gameId: "spin-and-win", teamId: "yellow", points: 40 },
  { gameId: "spin-and-win", teamId: "blue", points: 60 },
  { gameId: "spin-and-win", teamId: "red", points: 70 },
  { gameId: "spin-and-win", teamId: "green", points: 70 },
  { gameId: "spin-and-win", teamId: "purple", points: 90 },
  { gameId: "spin-and-win", teamId: "orange", points: 110 },
];

export const facts = [
  { label: "Venue", value: "Hotel Splendido, Portofino" },
  { label: "Dates", value: "15 – 17 November 2026" },
  { label: "Motto", value: "Together Beyond Boundaries" },
  { label: "Squads", value: "Six squads, one spirit" },
  { label: "Wifi", value: "SplendidoGuest" },
  { label: "Password", value: "portofino2026" },
];
