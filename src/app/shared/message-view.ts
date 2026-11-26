import { isOnline } from './presence';
import { AppUser } from '../models/user.model';
import { Message } from '../models/message.model';
import { ChatMessagePreview, MemberPreview } from '../models/view.models';
import { toReactionViews } from './reactions';
import { DEFAULT_AVATAR } from '../services/auth.service';
import { resolveAvatar } from './avatars';


/** Formats a timestamp as a German time string such as "09:30 Uhr". */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}


/** Returns "Heute", "Gestern" or the long German date for a timestamp. */
export function formatDay(timestamp: number): string {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === new Date().toDateString()) {
    return 'Heute';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Gestern';
  }
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}


/** Converts a user to the member preview shown in lists, marking the current user. */
export function toMemberPreview(user: AppUser, currentUid: string | null): MemberPreview {
  const isCurrentUser = user.uid === currentUid;
  return {
    id: user.uid, email: user.email, avatar: resolveAvatar(user.avatar, DEFAULT_AVATAR),
    name: isCurrentUser ? `${user.name} (Du)` : user.name,
    online: isCurrentUser || isOnline(user), isCurrentUser
  };
}


/** Converts a message to the preview shown in the chat, resolving author, times and reactions. */
export function toMessagePreview(message: Message, users: Map<string, AppUser>, currentUid: string | null): ChatMessagePreview {
  const author = users.get(message.authorId);
  return {
    id: message.id, authorId: message.authorId, text: message.text, createdAt: message.createdAt,
    author: author?.name ?? 'Unbekannt', avatar: resolveAvatar(author?.avatar, DEFAULT_AVATAR),
    time: formatTime(message.createdAt), isOwn: message.authorId === currentUid,
    edited: !!message.editedAt, repliesCount: message.threadCount,
    lastReplyTime: message.lastThreadAt ? formatTime(message.lastThreadAt) : undefined,
    reactions: toReactionViews(message.reactions)
  };
}
