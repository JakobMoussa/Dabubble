import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AddChannelModalComponent,
  CreatedChannelPayload
} from './add-channel-modal/add-channel-modal.component';
import { ThreadMessage, ThreadPanelComponent } from './thread-panel/thread-panel.component';
import { ProfileChanges, ProfilePopupComponent } from './profile-popup/profile-popup.component';
import { ChatMessageComponent, ReactionToggle } from './chat-message/chat-message.component';
import { ChannelChanges, ChannelSettingsComponent } from './channel-settings/channel-settings.component';
import { ChannelMembersComponent } from './channel-members/channel-members.component';
import { toAuthMessage } from '../../shared/auth-error-messages';
import { NewMessageHeaderComponent, Recipient } from './new-message-header/new-message-header.component';
import { MessageComposerComponent } from './message-composer/message-composer.component';
import { SearchBoxComponent, SearchSelection } from '../../shared/components/search-box/search-box.component';
import { ChannelPreview, ChatMessagePreview, MemberPreview } from '../../models/view.models';
import { WorkspaceStore } from '../../services/workspace.store';
import { WorkspaceActions } from '../../services/workspace-actions.service';
import { AuthService, DEFAULT_AVATAR } from '../../services/auth.service';
import { resolveAvatar } from '../../shared/avatars';
import { DayLabelPipe } from '../../shared/day-label.pipe';

export type { ChannelPreview, ChatMessagePreview, MemberPreview } from '../../models/view.models';

const EMPTY_CHANNEL: ChannelPreview = { id: '', name: '' };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThreadPanelComponent, AddChannelModalComponent, ProfilePopupComponent, ChatMessageComponent,
    ChannelSettingsComponent, ChannelMembersComponent, SearchBoxComponent,
    MessageComposerComponent, NewMessageHeaderComponent, DayLabelPipe],
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
  selectedProfileMember: MemberPreview | null = null;
  isChannelSettingsOpen = false;
  membersDialogMode: 'list' | 'add' | null = null;
  channelError = '';
  isNewMessage = false;
  newRecipient: Recipient | null = null;

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  /** Sets up effects that select the first channel and scroll to new messages. */
  constructor() {
    effect(() => this.selectFirstChannelOnce());
    effect(() => this.scrollOnNewMessages());
  }


  /** The signed-in user as a member preview, with a default fallback while not loaded. */
  get currentUser(): MemberPreview {
    const me = this.store.me();
    return me
      ? { id: me.uid, name: me.name, email: me.email, avatar: resolveAvatar(me.avatar, DEFAULT_AVATAR), online: true, isCurrentUser: true }
      : { id: '', name: '', avatar: DEFAULT_AVATAR, online: true, isCurrentUser: true };
  }


  /** All channels of the workspace. */
  get channels(): ChannelPreview[] {
    return this.store.channels();
  }


  /** All members of the workspace. */
  get members(): MemberPreview[] {
    return this.store.members();
  }


  /** Id of the active channel, or an empty string if a direct chat is active. */
  get activeChannelId(): string {
    const active = this.store.active();
    return active?.type === 'channel' ? active.id : '';
  }


  /** Id of the other participant in the active direct chat, or null if no direct chat is active. */
  get activeMemberId(): string | null {
    const active = this.store.active();
    if (active?.type !== 'direct') {
      return null;
    }
    const uid = this.store.uid();
    return active.id.split('_').find((id) => id !== uid) ?? uid;
  }


  /** Whether a thread panel is currently open. */
  get isThreadOpen(): boolean {
    return !!this.threadRootMessage;
  }


  /** The root message of the open thread, or null if none is open. */
  get threadRootMessage(): ThreadMessage | null {
    const parentId = this.store.threadParentId();
    return this.getCurrentMessages().find((msg) => msg.id === parentId) ?? null;
  }


  /** Replies of the open thread. */
  get threadReplies(): ThreadMessage[] {
    return this.store.threadMessages();
  }


  /** Avatar URLs of the active channel's members. */
  get channelMemberAvatars(): string[] {
    const memberIds = this.getActiveChannel().memberIds ?? [];
    return memberIds.map((id) => resolveAvatar(this.store.userMap().get(id)?.avatar, DEFAULT_AVATAR));
  }


  /** Members that belong to the active channel. */
  get channelMembers(): MemberPreview[] {
    const ids = new Set(this.getActiveChannel().memberIds ?? []);
    return this.members.filter((m) => ids.has(m.id));
  }


  /** Name of the active channel's creator, or 'Unbekannt' if unknown. */
  get channelCreatorName(): string {
    return this.store.userMap().get(this.getActiveChannel().createdBy ?? '')?.name ?? 'Unbekannt';
  }


  /** Opens the conversation chosen in the search box and shows the chat. */
  onSearchSelected(selection: SearchSelection): void {
    this.isNewMessage = false;
    this.store.openConversation(selection.conversation);
    this.showChat();
  }


  /** Opens the members dialog in add or list mode. */
  openMembers(addMode: boolean): void {
    this.membersDialogMode = addMode ? 'add' : 'list';
  }


  /** Saves channel name and description changes and stores any error message. */
  async saveChannel(changes: ChannelChanges): Promise<void> {
    try {
      this.channelError = '';
      await this.actions.updateChannel(this.activeChannelId, changes.name, changes.description);
    } catch (error) {
      this.channelError = error instanceof Error && error.message.startsWith('*') ? error.message : toAuthMessage(error);
    }
  }


  /** Leaves the active channel and returns to the mobile menu. */
  async leaveChannel(): Promise<void> {
    await this.actions.leaveChannel(this.activeChannelId);
    this.isChannelSettingsOpen = false;
    this.mobileView = 'menu';
  }


  /** Adds the given members to the active channel. */
  addChannelMembers(memberIds: string[]): Promise<void> {
    return this.actions.addMembers(this.activeChannelId, memberIds);
  }


  /** Map of user ids to user names. */
  get userNames(): Map<string, string> {
    return new Map([...this.store.userMap().values()].map((u) => [u.uid, u.name]));
  }


  /** Forwards a reaction toggle to the workspace actions. */
  onReactionToggled(event: ReactionToggle, inThread = false): void {
    this.actions.react(event.messageId, event.emoji, event.active, inThread);
  }


  /** Forwards an edited message text to the workspace actions. */
  onMessageEdited(event: { messageId: string; text: string }, inThread = false): void {
    this.actions.edit(event.messageId, event.text, inThread);
  }


  /** Opens the profile popup for the member with the given user id, if found. */
  openProfileById(uid: string): void {
    const member = this.members.find((m) => m.id === uid);
    if (member) {
      this.openProfileMember(member);
    }
  }


  /** Shows or hides the sidebar. */
  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }


  /** Opens the thread for the given message and focuses the reply input. */
  openThread(messageId: string): void {
    this.store.threadParentId.set(messageId);
    this.mobileView = 'thread';
    setTimeout(() => document.getElementById('thread-reply-input')?.focus(), 0);
  }


  /** Closes the thread panel. */
  closeThread(): void {
    this.store.threadParentId.set(null);
    if (this.mobileView === 'thread') {
      this.mobileView = 'chat';
    }
  }


  /** Opens the add-channel popup. */
  openChannelPopup(): void {
    this.isChannelPopupOpen = true;
  }


  /** Closes the add-channel popup. */
  closeChannelPopup(): void {
    this.isChannelPopupOpen = false;
  }


  /** Opens the settings popup. */
  openSettingsPopup(): void {
    this.isSettingsPopupOpen = true;
  }


  /** Closes the settings popup. */
  closeSettingsPopup(): void {
    this.isSettingsPopupOpen = false;
  }


  /** Opens the profile popup for the current user. */
  openProfileSettings(): void {
    this.openProfileMember(this.currentUser);
  }


  /** Opens the profile popup for the given member, defaulting to the current user. */
  openProfileMember(member?: MemberPreview | null): void {
    this.selectedProfileMember = member ?? this.currentUser;
    this.isSettingsPopupOpen = false;
    this.isProfilePopupOpen = true;
  }


  /** Closes the profile popup and clears the selected member. */
  closeProfilePopup(): void {
    this.isProfilePopupOpen = false;
    this.selectedProfileMember = null;
  }


  /** Saves the profile changes and closes the profile popup. */
  async updateProfile(changes: ProfileChanges): Promise<void> {
    await this.actions.updateProfile(changes.name, changes.avatar || DEFAULT_AVATAR);
    this.closeProfilePopup();
  }


  /** Logs the user out and navigates to the login page. */
  async logout(): Promise<void> {
    this.closeSettingsPopup();
    this.store.active.set(null);
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }


  /** Scrolls the message list to the bottom. */
  scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }


  /** Starts composing a new message with no recipient selected. */
  startNewMessage(): void {
    this.isNewMessage = true;
    this.newRecipient = null;
    this.store.threadParentId.set(null);
    this.mobileView = 'chat';
  }


  /** Sends a message to the selected recipient of a new message. */
  async sendNewMessage(text: string): Promise<void> {
    if (this.newRecipient) {
      this.isNewMessage = false;
      await this.actions.sendTo(this.newRecipient, text);
    }
  }


  /** Sends a message to the active conversation. */
  sendMessage(text: string): Promise<void> {
    return this.actions.send(text);
  }


  /** Sends a reply in the open thread. */
  sendReply(text: string): Promise<void> {
    return this.actions.reply(text);
  }


  /** Closes the settings popup when Escape is pressed. */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isSettingsPopupOpen) {
      this.closeSettingsPopup();
    }
  }


  /** Names of all existing channels. */
  getExistingChannelNames(): string[] {
    return this.channels.map((channel) => channel.name);
  }


  /** Creates a channel from the payload of the add-channel modal. */
  handleChannelCreated(payload: CreatedChannelPayload): Promise<void> {
    return this.actions.createChannel(payload.name, payload.description, payload.memberIds);
  }


  /** Expands or collapses the channel list. */
  toggleChannels(): void {
    this.isChannelsOpen = !this.isChannelsOpen;
  }


  /** Expands or collapses the direct message list. */
  toggleDirectMessages(): void {
    this.isDirectMessagesOpen = !this.isDirectMessagesOpen;
  }


  /** Opens the channel with the given id and shows the chat. */
  selectChannel(channelId: string): void {
    this.isNewMessage = false;
    this.store.openChannel(channelId);
    this.showChat();
  }


  /** Opens the direct chat with the given member and shows the chat. */
  async selectMember(memberId: string): Promise<void> {
    this.isNewMessage = false;
    await this.store.openDirect(memberId);
    this.showChat();
  }


  /** Switches the mobile view to the menu. */
  openMobileMenu(): void {
    this.mobileView = 'menu';
  }


  /** The active channel, or an empty channel if none is active. */
  getActiveChannel(): ChannelPreview {
    return this.channels.find((c) => c.id === this.activeChannelId) ?? EMPTY_CHANNEL;
  }


  /** The member of the active direct chat, or null if none. */
  getActiveMember(): MemberPreview | null {
    const memberId = this.activeMemberId;
    return memberId ? this.members.find((m) => m.id === memberId) ?? null : null;
  }


  /** Title of the active conversation: the member name or the channel name. */
  getActiveTitle(): string {
    const member = this.getActiveMember();
    return member ? member.name : `#${this.getActiveChannel().name}`;
  }


  /** Placeholder text for the message composer of the active conversation. */
  getComposerPlaceholder(): string {
    const member = this.getActiveMember();
    if (!member) {
      return `Nachricht an #${this.getActiveChannel().name}`;
    }
    return member.isCurrentUser ? 'Notiz an dich selbst...' : `Nachricht an ${member.name}`;
  }


  /** Messages of the active conversation. */
  getCurrentMessages(): ChatMessagePreview[] {
    return this.store.messages();
  }


  /** Switches to the chat view, scrolls down and focuses the message input. */
  private showChat(): void {
    this.mobileView = 'chat';
    this.scrollToBottom();
    setTimeout(() => document.getElementById('chat-message-input')?.focus(), 0);
  }


  /** Opens the first channel if no conversation is active yet. */
  private selectFirstChannelOnce(): void {
    const first = this.store.channels()[0];
    if (first && !this.store.active()) {
      this.store.openChannel(first.id);
    }
  }


  /** Scrolls to the bottom when messages are present. */
  private scrollOnNewMessages(): void {
    if (this.store.messages().length) {
      this.scrollToBottom();
    }
  }
}
