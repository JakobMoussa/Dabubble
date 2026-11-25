import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, distinctUntilChanged, map, of, retry, switchMap, timer } from 'rxjs';
import { AppUser } from '../models/user.model';
import { ConversationRef, Message } from '../models/message.model';
import { ChannelPreview, ChatMessagePreview, MemberPreview } from '../models/view.models';
import { toMemberPreview, toMessagePreview } from '../shared/message-view';
import { AuthService } from './auth.service';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { UserService } from './user.service';

/**
 * Keeps a Firestore listener alive: a short-lived permission error right after a write
 * (e.g. a freshly created channel) is retried instead of killing the signal for good.
 */
function resilient<T>(source: Observable<T[]>): Observable<T[]> {
  return source.pipe(
    retry({ count: 5, delay: (_error, attempt) => timer(attempt * 600) }),
    catchError(() => of([] as T[]))
  );
}

/** Central reactive state for the workspace (current user, lists, active chat, thread). */
@Injectable({ providedIn: 'root' })
export class WorkspaceStore {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly channelService = inject(ChannelService);
  private readonly messageService = inject(MessageService);

  readonly uid = toSignal(this.auth.user$.pipe(map((user) => user?.uid ?? null)), { initialValue: null });
  readonly active = signal<ConversationRef | null>(null);
  readonly threadParentId = signal<string | null>(null);

  private readonly uid$ = toObservable(this.uid);
  private readonly rawUsers = toSignal(this.whenSignedIn(() => this.userService.allUsers$()), { initialValue: [] });
  private readonly rawChannels = toSignal(
    this.uid$.pipe(switchMap((uid) => (uid ? resilient(this.channelService.channelsOf$(uid)) : of([])))),
    { initialValue: [] }
  );
  private readonly readableActive = computed(() => this.readable(this.active(), this.rawChannels()));
  private readonly rawMessages = toSignal(
    toObservable(this.readableActive).pipe(
      distinctUntilChanged((a, b) => a?.type === b?.type && a?.id === b?.id),
      switchMap((c) => (c ? resilient(this.messageService.messages$(c)) : of([])))
    ),
    { initialValue: [] as Message[] }
  );
  private readonly rawThread = toSignal(this.threadStream(), { initialValue: [] as Message[] });

  readonly userMap = computed(() => new Map(this.rawUsers().map((u) => [u.uid, u] as [string, AppUser])));
  readonly me = computed(() => this.userMap().get(this.uid() ?? '') ?? null);
  readonly members = computed(() => this.sortMembers(this.rawUsers().map((u) => toMemberPreview(u, this.uid()))));
  readonly channels = computed<ChannelPreview[]>(() => [...this.rawChannels()].sort((a, b) => a.createdAt - b.createdAt));
  readonly messages = computed(() => this.toPreviews(this.rawMessages()));
  readonly threadMessages = computed(() => this.toPreviews(this.rawThread()));


  /** Makes the channel the active conversation and closes any open thread. */
  openChannel(channelId: string): void {
    this.active.set({ type: 'channel', id: channelId });
    this.threadParentId.set(null);
  }


  /** Makes the conversation active and closes any open thread. */
  openConversation(conversation: ConversationRef): void {
    this.active.set(conversation);
    this.threadParentId.set(null);
  }


  /** Opens (and creates if needed) the direct chat with the member and closes any open thread. */
  async openDirect(memberId: string): Promise<void> {
    const uid = this.uid();
    if (!uid) {
      return;
    }
    this.active.set(await this.messageService.openDirectChat(uid, memberId));
    this.threadParentId.set(null);
  }


  /** Returns the conversation only if it is readable (direct chat or a channel the user belongs to), otherwise null. */
  private readable(conversation: ConversationRef | null, channels: ChannelPreview[]): ConversationRef | null {
    if (conversation?.type !== 'channel') {
      return conversation;
    }
    return channels.some((channel) => channel.id === conversation.id) ? conversation : null;
  }


  /** Emits the source list while a user is signed in and an empty list otherwise. */
  private whenSignedIn<T>(source: () => Observable<T[]>): Observable<T[]> {
    return this.uid$.pipe(switchMap((uid) => (uid ? resilient(source()) : of([] as T[]))));
  }


  /** Streams the replies of the open thread, or an empty list if none is open. */
  private threadStream(): Observable<Message[]> {
    return toObservable(this.threadParentId).pipe(
      switchMap((parentId) => {
        const conversation = this.active();
        return parentId && conversation ? resilient(this.messageService.thread$(conversation, parentId)) : of([]);
      })
    );
  }


  /** Converts messages to view previews using the known users. */
  private toPreviews(messages: Message[]): ChatMessagePreview[] {
    const users = this.userMap();
    return messages.map((message) => toMessagePreview(message, users, this.uid()));
  }


  /** Sorts members with the current user first, then alphabetically by name. */
  private sortMembers(members: MemberPreview[]): MemberPreview[] {
    return members.sort((a, b) => Number(!!b.isCurrentUser) - Number(!!a.isCurrentUser) || a.name.localeCompare(b.name));
  }
}
