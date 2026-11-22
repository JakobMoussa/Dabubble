import { ReactionView } from '../shared/reactions';

export interface ChannelPreview {
  id: string;
  name: string;
  description?: string;
  memberIds?: string[];
  createdBy?: string;
}

export interface MemberPreview {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  email?: string;
  isCurrentUser?: boolean;
}

export interface ChatMessagePreview {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  time: string;
  createdAt: number;
  text: string;
  isOwn: boolean;
  edited?: boolean;
  repliesCount?: number;
  lastReplyTime?: string;
  reactions?: ReactionView[];
}
