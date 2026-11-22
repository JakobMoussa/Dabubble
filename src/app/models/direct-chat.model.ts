export interface DirectChat {
  id: string;
  memberIds: string[];
}

/** Builds a stable id for a 1:1 chat, independent of who started it. */
export function buildDirectChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}
