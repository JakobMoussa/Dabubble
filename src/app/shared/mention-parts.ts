/** A piece of a message text; mentions carry the kind and id of the tagged user or channel. */
export interface MessagePart {
  text: string;
  mention?: MentionTarget;
}

export interface MentionTarget {
  kind: 'member' | 'channel';
  id: string;
}

interface MentionHit extends MentionTarget {
  index: number;
  token: string;
}


/** Splits a message into plain text, @-mentions of known users and #-mentions of known channels. */
export function splitMentions(text: string, userNames: Map<string, string>, channelNames: Map<string, string>): MessagePart[] {
  const targets = buildTargets(userNames, channelNames);
  const parts: MessagePart[] = [];
  let rest = text;
  for (let hit = nextMention(rest, targets); hit; hit = nextMention(rest, targets)) {
    if (hit.index > 0) {
      parts.push({ text: rest.slice(0, hit.index) });
    }
    parts.push({ text: hit.token, mention: { kind: hit.kind, id: hit.id } });
    rest = rest.slice(hit.index + hit.token.length);
  }
  return rest ? [...parts, { text: rest }] : parts;
}


/** Builds all mention tokens (`@Name`, `#channel`), longest first so full names win over prefixes. */
function buildTargets(userNames: Map<string, string>, channelNames: Map<string, string>): Omit<MentionHit, 'index'>[] {
  const users = [...userNames].map(([id, name]) => ({ kind: 'member' as const, id, token: `@${name}` }));
  const channels = [...channelNames].map(([id, name]) => ({ kind: 'channel' as const, id, token: `#${name}` }));
  return [...users, ...channels].filter((t) => t.token.length > 1).sort((a, b) => b.token.length - a.token.length);
}


/** Finds the earliest mention token in the text. */
function nextMention(text: string, targets: Omit<MentionHit, 'index'>[]): MentionHit | null {
  let best: MentionHit | null = null;
  for (const target of targets) {
    const index = text.indexOf(target.token);
    if (index >= 0 && (!best || index < best.index)) {
      best = { ...target, index };
    }
  }
  return best;
}
