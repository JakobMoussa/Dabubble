import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AddChannelModalComponent,
  CreatedChannelPayload
} from './add-channel-modal/add-channel-modal.component';
import { ThreadMessage, ThreadPanelComponent } from './thread-panel/thread-panel.component';
import { ProfilePopupComponent } from './profile-popup/profile-popup.component';
import { ChatMessageComponent, ReactionToggle } from './chat-message/chat-message.component';
import { ChannelPreview, ChatMessagePreview, MemberPreview } from '../../models/view.models';
import { WorkspaceStore } from '../../services/workspace.store';
import { WorkspaceActions } from '../../services/workspace-actions.service';
import { AuthService, DEFAULT_AVATAR } from '../../services/auth.service';

export type { ChannelPreview, ChatMessagePreview, MemberPreview } from '../../models/view.models';

const EMPTY_CHANNEL: ChannelPreview = { id: '', name: '' };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThreadPanelComponent, AddChannelModalComponent, ProfilePopupComponent, ChatMessageComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly store = inject(WorkspaceStore);
  private readonly actions = inject(WorkspaceActions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSidebarHidden = false;
  isSettingsPopupOpen = false;
  isChannelPopupOpen = false;
  isProfilePopupOpen = false;
  isChannelsOpen = true;
  isDirectMessagesOpen = true;
  mobileView: 'menu' | 'chat' | 'thread' = 'menu';
  messageText = '';
  selectedProfileMember: MemberPreview | null = null;

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => this.selectFirstChannelOnce());
    effect(() => this.scrollOnNewMessages());
  }


  get currentUser(): MemberPreview {
    const me = this.store.me();
    return me
      ? { id: me.uid, name: me.name, avatar: me.avatar || DEFAULT_AVATAR, online: true, isCurrentUser: true }
      : { id: '', name: '', avatar: DEFAULT_AVATAR, online: true, isCurrentUser: true };
  }


  get channels(): ChannelPreview[] {
    return this.store.channels();
  }


  get members(): MemberPreview[] {
    return this.store.members();
  }


  get activeChannelId(): string {
    const active = this.store.active();
    return active?.type === 'channel' ? active.id : '';
  }


  get activeMemberId(): string | null {
    const active = this.store.active();
    if (active?.type !== 'direct') {
      return null;
    }
    const uid = this.store.uid();
    return active.id.split('_').find((id) => id !== uid) ?? uid;
  }


  get isThreadOpen(): boolean {
    return !!this.threadRootMessage;
  }


  get threadRootMessage(): ThreadMessage | null {
    const parentId = this.store.threadParentId();
    return this.getCurrentMessages().find((msg) => msg.id === parentId) ?? null;
  }


  get threadReplies(): ThreadMessage[] {
    return this.store.threadMessages();
  }


  get channelMemberAvatars(): string[] {
    const memberIds = this.getActiveChannel().memberIds ?? [];
    return memberIds.map((id) => this.store.userMap().get(id)?.avatar || DEFAULT_AVATAR);
  }


  get userNames(): Map<string, string> {
    return new Map([...this.store.userMap().values()].map((u) => [u.uid, u.name]));
  }


  onReactionToggled(event: ReactionToggle, inThread = false): void {
    this.actions.react(event.messageId, event.emoji, event.active, inThread);
  }


  onMessageEdited(event: { messageId: string; text: string }, inThread = false): void {
    this.actions.edit(event.messageId, event.text, inThread);
  }


  openProfileById(uid: string): void {
    const member = this.members.find((m) => m.id === uid);
    if (member) {
      this.openProfileMember(member);
    }
  }


  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }


  openThread(messageId: string): void {
    this.store.threadParentId.set(messageId);
    this.mobileView = 'thread';
  }


  closeThread(): void {
    this.store.threadParentId.set(null);
    if (this.mobileView === 'thread') {
      this.mobileView = 'chat';
    }
  }


  openChannelPopup(): void {
    this.isChannelPopupOpen = true;
  }


  closeChannelPopup(): void {
    this.isChannelPopupOpen = false;
  }


  openSettingsPopup(): void {
    this.isSettingsPopupOpen = true;
  }


  closeSettingsPopup(): void {
    this.isSettingsPopupOpen = false;
  }


  openProfileSettings(): void {
    this.openProfileMember(this.currentUser);
  }


  openProfileMember(member?: MemberPreview | null): void {
    this.selectedProfileMember = member ?? this.currentUser;
    this.isSettingsPopupOpen = false;
    this.isProfilePopupOpen = true;
  }


  closeProfilePopup(): void {
    this.isProfilePopupOpen = false;
    this.selectedProfileMember = null;
  }


  async updateProfileName(newName: string): Promise<void> {
    await this.actions.updateProfile(newName, this.store.me()?.avatar ?? DEFAULT_AVATAR);
    this.closeProfilePopup();
  }


  async logout(): Promise<void> {
    this.closeSettingsPopup();
    this.store.active.set(null);
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }


  onComposerEnter(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.sendMessage();
    }
  }


  scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }


  insertEmoji(emoji = '😊'): void {
    this.messageText += emoji;
  }


  insertMention(): void {
    this.messageText += '@';
  }


  async sendMessage(): Promise<void> {
    const text = this.messageText;
    this.messageText = '';
    await this.actions.send(text);
  }


  sendReply(text: string): Promise<void> {
    return this.actions.reply(text);
  }


  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isSettingsPopupOpen) {
      this.closeSettingsPopup();
    }
  }


  getExistingChannelNames(): string[] {
    return this.channels.map((channel) => channel.name);
  }


  handleChannelCreated(payload: CreatedChannelPayload): Promise<void> {
    return this.actions.createChannel(payload.name, payload.description, payload.memberIds);
  }


  toggleChannels(): void {
    this.isChannelsOpen = !this.isChannelsOpen;
  }


  toggleDirectMessages(): void {
    this.isDirectMessagesOpen = !this.isDirectMessagesOpen;
  }


  selectChannel(channelId: string): void {
    this.store.openChannel(channelId);
    this.showChat();
  }


  async selectMember(memberId: string): Promise<void> {
    await this.store.openDirect(memberId);
    this.showChat();
  }


  openMobileMenu(): void {
    this.mobileView = 'menu';
  }


  getActiveChannel(): ChannelPreview {
    return this.channels.find((c) => c.id === this.activeChannelId) ?? EMPTY_CHANNEL;
  }


  getActiveMember(): MemberPreview | null {
    const memberId = this.activeMemberId;
    return memberId ? this.members.find((m) => m.id === memberId) ?? null : null;
  }


  getActiveTitle(): string {
    const member = this.getActiveMember();
    return member ? member.name : `#${this.getActiveChannel().name}`;
  }


  getComposerPlaceholder(): string {
    const member = this.getActiveMember();
    if (!member) {
      return `Nachricht an #${this.getActiveChannel().name}`;
    }
    return member.isCurrentUser ? 'Notiz an dich selbst...' : `Nachricht an ${member.name}`;
  }


  getCurrentMessages(): ChatMessagePreview[] {
    return this.store.messages();
  }


  private showChat(): void {
    this.mobileView = 'chat';
    this.scrollToBottom();
    setTimeout(() => document.getElementById('chat-message-input')?.focus(), 0);
  }


  private selectFirstChannelOnce(): void {
    const first = this.store.channels()[0];
    if (first && !this.store.active()) {
      this.store.openChannel(first.id);
    }
  }


  private scrollOnNewMessages(): void {
    if (this.store.messages().length) {
      this.scrollToBottom();
    }
  }
}
