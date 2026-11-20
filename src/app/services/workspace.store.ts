import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, map, of, switchMap } from 'rxjs';
import { AppUser } from '../models/user.model';
import { ConversationRef, Message } from '../models/message.model';
import { ChannelPreview, ChatMessagePreview, MemberPreview } from '../models/view.models';
import { toMemberPreview, toMessagePreview } from '../shared/message-view';
import { AuthService } from './auth.service';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { UserService } from './user.service';

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
    this.uid$.pipe(switchMap((uid) => (uid ? this.channelService.channelsOf$(uid) : of([])))),
    { initialValue: [] }
  );
  private readonly rawMessages = toSignal(
    toObservable(this.active).pipe(switchMap((c) => (c ? this.messageService.messages$(c) : of([])))),
    { initialValue: [] as Message[] }
  );
  private readonly rawThread = toSignal(this.threadStream(), { initialValue: [] as Message[] });

  readonly userMap = computed(() => new Map(this.rawUsers().map((u) => [u.uid, u] as [string, AppUser])));
  readonly me = computed(() => this.userMap().get(this.uid() ?? '') ?? null);
  readonly members = computed(() => this.sortMembers(this.rawUsers().map((u) => toMemberPreview(u, this.uid()))));
  readonly channels = computed<ChannelPreview[]>(() => [...this.rawChannels()].sort((a, b) => a.createdAt - b.createdAt));
  readonly messages = computed(() => this.toPreviews(this.rawMessages()));
  readonly threadMessages = computed(() => this.toPreviews(this.rawThread()));


  openChannel(channelId: string): void {
    this.active.set({ type: 'channel', id: channelId });
    this.threadParentId.set(null);
  }


  async openDirect(memberId: string): Promise<void> {
    const uid = this.uid();
    if (!uid) {
      return;
    }
    this.active.set(await this.messageService.openDirectChat(uid, memberId));
    this.threadParentId.set(null);
  }


  private whenSignedIn<T>(source: () => Observable<T[]>): Observable<T[]> {
    return this.uid$.pipe(switchMap((uid) => (uid ? source() : of([] as T[]))));
  }


  private threadStream(): Observable<Message[]> {
    return toObservable(this.threadParentId).pipe(
      switchMap((parentId) => {
        const conversation = this.active();
        return parentId && conversation ? this.messageService.thread$(conversation, parentId) : of([]);
      })
    );
  }


  private toPreviews(messages: Message[]): ChatMessagePreview[] {
    const users = this.userMap();
    return messages.map((message) => toMessagePreview(message, users, this.uid()));
  }


  private sortMembers(members: MemberPreview[]): MemberPreview[] {
    return members.sort((a, b) => Number(!!b.isCurrentUser) - Number(!!a.isCurrentUser) || a.name.localeCompare(b.name));
  }
}
