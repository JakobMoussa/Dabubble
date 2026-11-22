export interface ChannelPreview {
  id: string;
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface MemberPreview {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  isCurrentUser?: boolean;
}

export interface ChatReaction {
  emoji: string;
  count: number;
}

export interface ChatMessagePreview {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  isOwn: boolean;
  repliesCount?: number;
  lastReplyTime?: string;
  reactions?: ChatReaction[];
  isEdited?: boolean;
}
