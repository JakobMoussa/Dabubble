/** Emoji -> list of user ids who reacted with it. */
export type ReactionMap = Record<string, string[]>;

export interface Message {
  id: string;
  text: string;
  authorId: string;
  createdAt: number;
  editedAt: number | null;
  reactions: ReactionMap;
  threadCount: number;
  lastThreadAt: number | null;
}

export type ConversationType = 'channel' | 'direct';

export interface ConversationRef {
  type: ConversationType;
  id: string;
}
