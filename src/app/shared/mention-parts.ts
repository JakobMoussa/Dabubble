/** A piece of a message text; mentions carry the uid of the tagged user. */
export interface MessagePart {
  text: string;
  uid?: string;
}

interface MentionHit {
  index: number;
  uid: string;
  name: string;
}


/** Splits a message into plain text and @-mentions of known users (longest names first). */
export function splitMentions(text: string, userNames: Map<string, string>): MessagePart[] {
  const targets = [...userNames].filter(([, name]) => name).sort((a, b) => b[1].length - a[1].length);
  const parts: MessagePart[] = [];
  let rest = text;
  for (let hit = nextMention(rest, targets); hit; hit = nextMention(rest, targets)) {
    if (hit.index > 0) {
      parts.push({ text: rest.slice(0, hit.index) });
    }
    parts.push({ text: `@${hit.name}`, uid: hit.uid });
    rest = rest.slice(hit.index + hit.name.length + 1);
  }
  return rest ? [...parts, { text: rest }] : parts;
}


/** Finds the earliest @-mention of one of the given users in the text. */
function nextMention(text: string, targets: [string, string][]): MentionHit | null {
  let best: MentionHit | null = null;
  for (const [uid, name] of targets) {
    const index = text.indexOf(`@${name}`);
    if (index >= 0 && (!best || index < best.index)) {
      best = { index, uid, name };
    }
  }
  return best;
}
