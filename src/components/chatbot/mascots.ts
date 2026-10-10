import type { RobotHeadShape, RobotHeadState } from './robot-heads';

export interface DailyMascotTheme {
  dayIndex: number; // 0 (Sunday) to 6 (Saturday)
  dayName: string;
  themeName: string;
  color: string;
  trimColor: string;
  screenColor: string;
  hoverColor: string;
  glowColor: string;
  textColor: string;
  description: string;
}

export interface MascotData {
  id: string;
  name: string;
  shape: RobotHeadShape;
  state?: RobotHeadState;
  color: string;
  trimColor: string;
  screenColor: string;
  antenna?: boolean;
  description: string;
  hoverColor?: string;
  glowColor?: string;
  textColor?: string;
  dayName?: string;
  themeName?: string;
}

/**
 * Curated 7-day thematic color palette.
 * Automatically rotates every day of the week, giving Kairo AI a fresh, vibrant personality.
 * The send button dynamically mirrors this exact day color.
 */
export const DAILY_MASCOT_THEMES: DailyMascotTheme[] = [
  {
    dayIndex: 0,
    dayName: 'Sunday',
    themeName: 'Solar Amber',
    color: '#d97706',
    trimColor: '#fde68a',
    screenColor: '#fffbeb',
    hoverColor: '#b45309',
    glowColor: 'rgba(217, 119, 6, 0.45)',
    textColor: '#ffffff',
    description: 'High-energy warm amber and golden solar aesthetic for a bright Sunday.',
  },
  {
    dayIndex: 1,
    dayName: 'Monday',
    themeName: 'Cyber Emerald',
    color: '#059669',
    trimColor: '#6ee7b7',
    screenColor: '#ecfdf5',
    hoverColor: '#047857',
    glowColor: 'rgba(5, 150, 105, 0.45)',
    textColor: '#ffffff',
    description: 'Crisp futuristic cyber matrix emerald green to kick off the work week.',
  },
  {
    dayIndex: 2,
    dayName: 'Tuesday',
    themeName: 'Electric Cyan',
    color: '#0284c7',
    trimColor: '#7dd3fc',
    screenColor: '#f0f9ff',
    hoverColor: '#0369a1',
    glowColor: 'rgba(2, 132, 199, 0.45)',
    textColor: '#ffffff',
    description: 'Futuristic azure and vibrant electric sky cyan.',
  },
  {
    dayIndex: 3,
    dayName: 'Wednesday',
    themeName: 'Electric Violet',
    color: '#7c3aed',
    trimColor: '#c4b5fd',
    screenColor: '#f5f3ff',
    hoverColor: '#6d28d9',
    glowColor: 'rgba(124, 58, 237, 0.45)',
    textColor: '#ffffff',
    description: 'Mystic deep royal neon violet and electric purple for midweek focus.',
  },
  {
    dayIndex: 4,
    dayName: 'Thursday',
    themeName: 'Quantum Teal',
    color: '#0d9488',
    trimColor: '#5eead4',
    screenColor: '#f0fdfa',
    hoverColor: '#0f766e',
    glowColor: 'rgba(13, 148, 136, 0.45)',
    textColor: '#ffffff',
    description: 'Deep high-tech quantum teal and aquamarine crystal luster.',
  },
  {
    dayIndex: 5,
    dayName: 'Friday',
    themeName: 'Neon Crimson',
    color: '#e11d48',
    trimColor: '#fda4af',
    screenColor: '#fff1f2',
    hoverColor: '#be123c',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    textColor: '#ffffff',
    description: 'High-octane neon rose and crimson ruby celebrating Friday momentum.',
  },
  {
    dayIndex: 6,
    dayName: 'Saturday',
    themeName: 'Cobalt Blue',
    color: '#2b49a3',
    trimColor: '#93a6c8',
    screenColor: '#e8f2ff',
    hoverColor: '#1e3a8a',
    glowColor: 'rgba(43, 73, 163, 0.45)',
    textColor: '#ffffff',
    description: 'Signature classic deep cobalt blue and silver trim weekend companion.',
  },
];

/**
 * Returns the current day's mascot with matching theme colors.
 * Automatically changes every single day (Sunday = Solar Amber, Monday = Cyber Emerald, etc.).
 * Supports `?mascotDay=0..6` query param for developer and preview testing.
 */
export function getDailyMascot(date?: Date): MascotData & DailyMascotTheme {
  let dayIndex = (date ?? new Date()).getDay();

  if (typeof window !== 'undefined') {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramDay = urlParams.get('mascotDay');
      if (paramDay !== null && !isNaN(Number(paramDay))) {
        dayIndex = ((Number(paramDay) % 7) + 7) % 7;
      }
    } catch {
      // Ignore URL parsing errors in non-browser environments
    }
  }

  const theme = DAILY_MASCOT_THEMES[dayIndex] || DAILY_MASCOT_THEMES[6];

  return {
    ...theme,
    id: `kairo-square-${theme.dayName.toLowerCase()}`,
    name: `Kairo AI (${theme.themeName})`,
    shape: 'square',
    antenna: true,
    description: `Kairo AI in ${theme.themeName} (${theme.dayName} Edition) — Your Personal AI Companion.`,
  };
}

/**
 * Static reference mascot (defaults to Saturday's classic cobalt blue).
 */
export const SQUARE_ROBOT_MASCOT: MascotData = {
  id: 'kairo-square',
  name: 'Kairo AI',
  shape: 'square',
  color: '#2b49a3',
  trimColor: '#93a6c8',
  screenColor: '#e8f2ff',
  antenna: true,
  hoverColor: '#1e3a8a',
  glowColor: 'rgba(43, 73, 163, 0.45)',
  textColor: '#ffffff',
  dayName: 'Saturday',
  themeName: 'Cobalt Blue',
  description: 'Kairo AI — Your Personal AI Companion in classic glossy blue square TV robot shell with LED matrix and antenna.',
};

export const ROBOT_MASCOTS: MascotData[] = [
  SQUARE_ROBOT_MASCOT,
];

export const ALL_MASCOTS = ROBOT_MASCOTS;

/**
 * Helper to get a specific mascot by ID or fallback to current daily mascot.
 */
export function getMascotById(id?: string): MascotData {
  if (!id) return getDailyMascot();
  const found = DAILY_MASCOT_THEMES.find(
    (t) => `kairo-square-${t.dayName.toLowerCase()}` === id
  );
  if (found) {
    return {
      ...found,
      id: `kairo-square-${found.dayName.toLowerCase()}`,
      name: `Kairo AI (${found.themeName})`,
      shape: 'square',
      antenna: true,
      description: `Kairo AI in ${found.themeName} (${found.dayName} Edition).`,
    };
  }
  return getDailyMascot();
}

export const MASCOT_FACES: Array<{ id: RobotHeadState; label: string; desc: string }> = [
  { id: 'happy', label: 'Happy', desc: 'Bouncing smiles with glowing pink light' },
  { id: 'idle', label: 'Idle', desc: 'Looks around, blinks, hops now & then' },
  { id: 'listening', label: 'Listening', desc: 'Alert eyes with audio equalizer waves' },
  { id: 'speaking', label: 'Speaking', desc: 'Animated talking mouth with words' },
  { id: 'thinking', label: 'Thinking', desc: 'Eyes up, pulsing dots, amber light' },
  { id: 'searching', label: 'Searching', desc: 'Sweeping cyan scanning beam' },
  { id: 'working', label: 'Working', desc: 'Focused eyes with progress bar' },
  { id: 'sleeping', label: 'Sleeping', desc: 'Drooped dim eyes dreaming in Zs' },
  { id: 'error', label: 'Error', desc: 'Red X eyes & head shaking' },
];
