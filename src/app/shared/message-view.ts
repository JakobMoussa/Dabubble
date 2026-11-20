import { AppUser } from '../models/user.model';
import { Message } from '../models/message.model';
import { ChatMessagePreview, MemberPreview } from '../models/view.models';
import { toReactionViews } from './reactions';
import { DEFAULT_AVATAR } from '../services/auth.service';


export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}


export function formatDay(timestamp: number): string {
  const date = new Date(timestamp);
  if (date.toDateString() === new Date().toDateString()) {
    return 'Heute';
  }
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}


export function toMemberPreview(user: AppUser, currentUid: string | null): MemberPreview {
  const isCurrentUser = user.uid === currentUid;
  return {
    id: user.uid, email: user.email, avatar: user.avatar || DEFAULT_AVATAR,
    name: isCurrentUser ? `${user.name} (Du)` : user.name,
    online: user.status === 'online', isCurrentUser
  };
}


export function toMessagePreview(message: Message, users: Map<string, AppUser>, currentUid: string | null): ChatMessagePreview {
  const author = users.get(message.authorId);
  return {
    id: message.id, authorId: message.authorId, text: message.text, createdAt: message.createdAt,
    author: author?.name ?? 'Unbekannt', avatar: author?.avatar || DEFAULT_AVATAR,
    time: formatTime(message.createdAt), isOwn: message.authorId === currentUid,
    edited: !!message.editedAt, repliesCount: message.threadCount,
    lastReplyTime: message.lastThreadAt ? formatTime(message.lastThreadAt) : undefined,
    reactions: toReactionViews(message.reactions)
  };
}
