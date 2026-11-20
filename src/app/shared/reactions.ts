import { ReactionMap } from '../models/message.model';

export const DEFAULT_QUICK_EMOJIS = ['✅', '👍'];
export const MAX_REACTIONS_DESKTOP = 20;
export const MAX_REACTIONS_COMPACT = 7;
const RECENT_KEY = 'dabubble_recent_emojis';

export interface ReactionView {
  emoji: string;
  count: number;
  userIds: string[];
}


/** Turns the stored map into a sorted list without empty entries. */
export function toReactionViews(reactions: ReactionMap): ReactionView[] {
  return Object.entries(reactions ?? {})
    .filter(([, userIds]) => userIds.length > 0)
    .map(([emoji, userIds]) => ({ emoji, count: userIds.length, userIds }));
}


/** Splits reactions into the visible ones and the "+ x weitere" rest. */
export function limitReactions(views: ReactionView[], limit: number): { visible: ReactionView[]; hidden: number } {
  return { visible: views.slice(0, limit), hidden: Math.max(views.length - limit, 0) };
}


export function readRecentEmojis(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
    return stored.length ? stored.slice(0, 2) : DEFAULT_QUICK_EMOJIS;
  } catch {
    return DEFAULT_QUICK_EMOJIS;
  }
}


export function rememberEmoji(emoji: string): void {
  try {
    const recent = [emoji, ...readRecentEmojis().filter((e) => e !== emoji)].slice(0, 2);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    /* storage unavailable (private mode) - quick bar falls back to defaults */
  }
}
