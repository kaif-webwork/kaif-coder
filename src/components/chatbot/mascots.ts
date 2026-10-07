export interface MascotData {
  id: string;
  name: string;
  directions: string;
  reactions: string;
}

// Curated pool of ONLY cute robots, tech bots & digital companions (no human faces)
const CURATED_BOT_MASCOTS: Array<{ id: string; name: string }> = [
  { id: 'tv', name: 'Kivo TV Bot' },
  { id: 'crt', name: 'Kivo CRT Bot' },
  { id: 'drone', name: 'Kivo Drone' },
  { id: 'gearbot', name: 'Kivo Gearbot' },
  { id: 'radio', name: 'Kivo Radio Bot' },
  { id: 'rocket', name: 'Kivo Rocket' },
  { id: 'toaster', name: 'Kivo Cyber Toaster' },
  { id: 'clockwork', name: 'Kivo Clockwork' },
  { id: 'postbot', name: 'Kivo Postbot' },
  { id: 'cube', name: 'Kivo Cube' },
  { id: 'lantern', name: 'Kivo Lantern' },
  { id: 'astronaut', name: 'Kivo Astronaut' },
  { id: 'knight', name: 'Kivo Cyber Knight' },
  { id: 'scout', name: 'Kivo Scout Bot' },
  { id: 'cat', name: 'Kivo Cyber Cat' },
  { id: 'fox', name: 'Kivo Cyber Fox' },
  { id: 'dino', name: 'Kivo Cyber Dino' },
  { id: 'owl', name: 'Kivo Cyber Owl' },
  { id: 'panda', name: 'Kivo Cyber Panda' },
  { id: 'otter', name: 'Kivo Cyber Otter' },
  { id: 'koala', name: 'Kivo Cyber Koala' },
  { id: 'penguin', name: 'Kivo Cyber Penguin' },
];

export const ALL_MASCOTS: MascotData[] = CURATED_BOT_MASCOTS.map((item) => ({
  ...item,
  directions: `/mascots/${item.id}-directions.webp`,
  reactions: `/mascots/${item.id}-reactions.webp`,
}));

/**
 * Returns today's mascot automatically based on the current calendar date.
 * Every day at 00:00:00 midnight (local time), it rotates to the next bot in the pool.
 */
export function getDailyMascot(): MascotData {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs(dayOfYear) % ALL_MASCOTS.length;
  return ALL_MASCOTS[index];
}

/**
 * Helper to get a specific mascot by ID or fallback to daily mascot.
 */
export function getMascotById(id?: string): MascotData {
  if (!id) return getDailyMascot();
  const found = ALL_MASCOTS.find((m) => m.id === id);
  return found || getDailyMascot();
}
