import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AddChannelModalComponent,
  CreatedChannelPayload
} from './add-channel-modal/add-channel-modal.component';
import { ThreadMessage, ThreadPanelComponent } from './thread-panel/thread-panel.component';
import { ProfilePopupComponent } from './profile-popup/profile-popup.component';
import { ChannelPreview, ChatMessagePreview, MemberPreview } from './dashboard.models';
import {
  CURRENT_USER,
  INITIAL_CHANNELS,
  INITIAL_MEMBERS,
  INITIAL_CHANNEL_AVATARS,
  INITIAL_CHANNEL_MESSAGES,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_THREAD_ROOT,
  INITIAL_THREAD_REPLIES
} from './dashboard-mock-data';

export * from './dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThreadPanelComponent, AddChannelModalComponent, ProfilePopupComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  isSidebarHidden = false;
  isSettingsPopupOpen = false;
  isChannelPopupOpen = false;
  isProfilePopupOpen = false;
  isThreadOpen = true;
  isChannelsOpen = true;
  isDirectMessagesOpen = true;
  mobileView: 'menu' | 'chat' | 'thread' = 'menu';

  activeChannelId = 'entwicklerteam';
  activeMemberId: string | null = null;
  messageText = '';
  selectedProfileMember: MemberPreview | null = null;
  activeEmojiPickerMessageId: string | null = null;
  activeOptionsMessageId: string | null = null;
  editingMessageId: string | null = null;
  editedMessageText = '';
  readonly availableEmojis = ['👍', '❤️', '🚀', '✅', '🎉', '😂', '🔥', '👏'];

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  readonly currentUser: MemberPreview = CURRENT_USER;
  channels: ChannelPreview[] = [...INITIAL_CHANNELS];
  readonly members: MemberPreview[] = [...INITIAL_MEMBERS];
  readonly channelMemberAvatars: string[] = [...INITIAL_CHANNEL_AVATARS];

  readonly channelMessages: Record<string, ChatMessagePreview[]> = { ...INITIAL_CHANNEL_MESSAGES };
  readonly directMessages: Record<string, ChatMessagePreview[]> = { ...INITIAL_DIRECT_MESSAGES };

  threadRootMessage: ThreadMessage = INITIAL_THREAD_ROOT;
  readonly threadReplies: ThreadMessage[] = [...INITIAL_THREAD_REPLIES];


  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }


  openThread(): void {
    this.isThreadOpen = true;
    this.mobileView = 'thread';
  }


  closeThread(): void {
    this.isThreadOpen = false;
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

  updateProfileName(newName: string): void {
    this.currentUser.name = newName;
    if (this.selectedProfileMember?.id === this.currentUser.id) {
      this.selectedProfileMember.name = newName;
    }
  }

  getCurrentTimeString(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} Uhr`;
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
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
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

  sendMessage(): void {
    const text = this.messageText.trim();
    if (!text) return;
    this.appendMessage({
      id: `msg-${Date.now()}`,
      author: this.currentUser.name,
      avatar: this.currentUser.avatar,
      time: this.getCurrentTimeString(),
      text,
      isOwn: true
    });
    this.messageText = '';
    this.scrollToBottom();
  }

  private appendMessage(msg: ChatMessagePreview): void {
    if (this.activeMemberId) {
      const current = this.directMessages[this.activeMemberId] ?? [];
      this.directMessages[this.activeMemberId] = [...current, msg];
      return;
    }
    const current = this.channelMessages[this.activeChannelId] ?? [];
    this.channelMessages[this.activeChannelId] = [...current, msg];
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isSettingsPopupOpen) {
      this.closeSettingsPopup();
    }
    if (this.activeEmojiPickerMessageId) {
      this.closeEmojiPicker();
    }
    if (this.activeOptionsMessageId) {
      this.closeMessageOptions();
    }
    if (this.editingMessageId) {
      this.cancelEditMessage();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.activeEmojiPickerMessageId) {
      this.closeEmojiPicker();
    }
    if (this.activeOptionsMessageId) {
      this.closeMessageOptions();
    }
  }

  openMessageOptions(msg: ChatMessagePreview, event?: Event): void {
    event?.stopPropagation();
    this.activeOptionsMessageId = this.activeOptionsMessageId === msg.id ? null : msg.id;
  }

  closeMessageOptions(): void {
    this.activeOptionsMessageId = null;
  }

  startEditMessage(msg: ChatMessagePreview): void {
    if (!msg.isOwn) return;
    this.editingMessageId = msg.id;
    this.editedMessageText = msg.text;
    this.closeMessageOptions();
  }

  cancelEditMessage(): void {
    this.editingMessageId = null;
    this.editedMessageText = '';
  }

  saveEditMessage(msg: ChatMessagePreview): void {
    const trimmed = this.editedMessageText.trim();
    if (!trimmed) return;
    msg.text = trimmed;
    msg.isEdited = true;
    this.cancelEditMessage();
  }

  onEditKeydown(event: KeyboardEvent, msg: ChatMessagePreview): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveEditMessage(msg);
    }
  }

  toggleReaction(msg: ChatMessagePreview, emoji: string): void {
    if (!msg.reactions) {
      msg.reactions = [];
    }
    const existing = msg.reactions.find((r) => r.emoji === emoji);
    if (existing) {
      existing.count += 1;
    } else {
      msg.reactions.push({ emoji, count: 1 });
    }
  }

  openEmojiPicker(msg: ChatMessagePreview, event?: Event): void {
    event?.stopPropagation();
    this.activeEmojiPickerMessageId = this.activeEmojiPickerMessageId === msg.id ? null : msg.id;
  }

  addReactionAndClose(msg: ChatMessagePreview, emoji: string): void {
    this.toggleReaction(msg, emoji);
    this.activeEmojiPickerMessageId = null;
  }

  closeEmojiPicker(): void {
    this.activeEmojiPickerMessageId = null;
  }

  openThreadForMessage(msg: ChatMessagePreview): void {
    this.threadRootMessage = {
      id: msg.id,
      author: msg.author,
      avatar: msg.avatar,
      time: msg.time,
      text: msg.text,
      isOwn: msg.isOwn
    };
    this.isThreadOpen = true;
    this.mobileView = 'thread';
  }

  getExistingChannelNames(): string[] {
    return this.channels.map((channel) => channel.name);
  }

  handleChannelCreated(payload: CreatedChannelPayload): void {
    const id = `${payload.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newChannel: ChannelPreview = {
      id,
      name: payload.name,
      description: payload.description,
      memberIds: payload.memberIds
    };
    this.channels = [...this.channels, newChannel];
    this.selectChannel(id);
  }

  toggleChannels(): void {
    this.isChannelsOpen = !this.isChannelsOpen;
  }


  toggleDirectMessages(): void {
    this.isDirectMessagesOpen = !this.isDirectMessagesOpen;
  }


  selectChannel(channelId: string): void {
    this.activeChannelId = channelId;
    this.activeMemberId = null;
    this.mobileView = 'chat';
    this.scrollToBottom();
  }


  selectMember(memberId: string): void {
    this.activeMemberId = memberId;
    this.mobileView = 'chat';
    this.scrollToBottom();
  }


  openMobileMenu(): void {
    this.mobileView = 'menu';
  }


  getActiveChannel(): ChannelPreview {
    return this.channels.find((c) => c.id === this.activeChannelId) ?? this.channels[0];
  }


  getActiveMember(): MemberPreview | null {
    if (!this.activeMemberId) {
      return null;
    }
    return this.members.find((m) => m.id === this.activeMemberId) ?? null;
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
    if (member.isCurrentUser || member.id === this.currentUser.id) {
      return 'Notiz an dich selbst...';
    }
    return `Nachricht an ${member.name}`;
  }


  getCurrentMessages(): ChatMessagePreview[] {
    if (this.activeMemberId) {
      return this.directMessages[this.activeMemberId] ?? [];
    }
    return this.channelMessages[this.activeChannelId] ?? [];
  }
}
