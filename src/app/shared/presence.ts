import { AppUser } from '../models/user.model';

/** A user whose last heartbeat is older than this counts as offline, e.g. after closing the tab without logout. */
export const PRESENCE_TIMEOUT_MS = 3 * 60_000;


/** Checks whether the user is online: status online and a recent heartbeat (guests without heartbeat are offline). */
export function isOnline(user: AppUser, now = Date.now()): boolean {
  if (user.status !== 'online') return false;
  if (user.lastSeen === undefined) return !user.isGuest;
  return now - user.lastSeen < PRESENCE_TIMEOUT_MS;
}
