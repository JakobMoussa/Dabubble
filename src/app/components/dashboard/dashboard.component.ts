import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AddChannelModalComponent,
  CreatedChannelPayload
} from './add-channel-modal/add-channel-modal.component';
import {
  ThreadMessage,
  ThreadPanelComponent
} from './thread-panel/thread-panel.component';
import { ProfilePopupComponent } from './profile-popup/profile-popup.component';

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

export interface ChatMessagePreview {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  isOwn: boolean;
  repliesCount?: number;
  lastReplyTime?: string;
  reactions?: { emoji: string; count: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ThreadPanelComponent,
    AddChannelModalComponent,
    ProfilePopupComponent
  ],
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

  @ViewChild('messagesContainer')
  private messagesContainer?: ElementRef<HTMLDivElement>;

  readonly currentUser: MemberPreview = {
    id: 'frederik',
    name: 'Frederik Beck',
    avatar: 'assets/img/Frederik Beck.png',
    online: true,
    isCurrentUser: true
  };

  channels: ChannelPreview[] = [
    {
      id: 'entwicklerteam',
      name: 'Entwicklerteam'
    },
    {
      id: 'office-team',
      name: 'Office-team'
    }
  ];

  readonly members: MemberPreview[] = [
    {
      id: 'frederik',
      name: 'Frederik Beck (Du)',
      avatar: 'assets/img/Frederik Beck.png',
      online: true,
      isCurrentUser: true
    },
    {
      id: 'sofia',
      name: 'Sofia Müller',
      avatar: 'assets/img/Sofia Müller.png',
      online: true
    },
    {
      id: 'noah',
      name: 'Noah Braun',
      avatar: 'assets/img/Noah Braun.png',
      online: true
    },
    {
      id: 'elise',
      name: 'Elise Roth',
      avatar: 'assets/img/Elise Roth.png',
      online: false
    },
    {
      id: 'elias',
      name: 'Elias Neumann',
      avatar: 'assets/img/Elias Neumann.png',
      online: true
    },
    {
      id: 'steffen',
      name: 'Steffen Hoffmann',
      avatar: 'assets/img/Steffen Hoffmann.png',
      online: false
    }
  ];

  readonly channelMemberAvatars: string[] = [
    'assets/img/Sofia Müller.png',
    'assets/img/Noah Braun.png',
    'assets/img/Frederik Beck.png'
  ];

  readonly channelMessages: Record<string, ChatMessagePreview[]> = {
    'entwicklerteam': [
      {
        id: 'm1',
        author: 'Noah Braun',
        avatar: 'assets/img/Noah Braun.png',
        time: '14:25 Uhr',
        text: 'Welche Version von Angular nutzen wir aktuell für das DABubble-Projekt?',
        isOwn: false,
        repliesCount: 2,
        lastReplyTime: '14:56'
      },
      {
        id: 'm2',
        author: 'Frederik Beck',
        avatar: 'assets/img/Frederik Beck.png',
        time: '15:06 Uhr',
        text: 'Wir nutzen Angular 19 mit Standalone Components und SCSS. Sieht schon richtig sauber aus!',
        isOwn: true,
        reactions: [
          {
            emoji: '🚀',
            count: 1
          },
          {
            emoji: '✅',
            count: 2
          }
        ]
      }
    ],

    'office-team': [
      {
        id: 'ot-1',
        author: 'Sofia Müller',
        avatar: 'assets/img/Sofia Müller.png',
        time: '10:15 Uhr',
        text: 'Guten Morgen zusammen! Willkommen im Office-Team-Channel.',
        isOwn: false
      }
    ]
  };

  readonly directMessages: Record<string, ChatMessagePreview[]> = {
    'frederik': [],
    'sofia': [],
    'noah': [],
    'elise': [],
    'elias': [],
    'steffen': []
  };

  readonly threadRootMessage: ThreadMessage = {
    id: 'm1',
    author: 'Noah Braun',
    avatar: 'assets/img/Noah Braun.png',
    time: '14:25 Uhr',
    text: 'Welche Version von Angular nutzen wir aktuell für das DABubble-Projekt?',
    isOwn: false
  };

  readonly threadReplies: ThreadMessage[] = [
    {
      id: 'r1',
      author: 'Sofia Müller',
      avatar: 'assets/img/Sofia Müller.png',
      time: '14:30 Uhr',
      text: 'Ich habe hier Angular 19 mit Standalone Components und SCSS im Einsatz!',
      isOwn: false
    },
    {
      id: 'r2',
      author: 'Frederik Beck',
      avatar: 'assets/img/Frederik Beck.png',
      time: '14:56 Uhr',
      text: 'Genau, das nutzen wir im gesamten Projekt.',
      isOwn: true,
      reactions: [
        {
          emoji: '👍',
          count: 1
        }
      ]
    }
  ];

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
      if (!this.messagesContainer) {
        return;
      }

      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
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

    if (!text) {
      return;
    }

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

  private appendMessage(message: ChatMessagePreview): void {
    if (this.activeMemberId) {
      const messages = this.directMessages[this.activeMemberId] ?? [];

      this.directMessages[this.activeMemberId] = [
        ...messages,
        message
      ];

      return;
    }

    const messages = this.channelMessages[this.activeChannelId] ?? [];

    this.channelMessages[this.activeChannelId] = [
      ...messages,
      message
    ];
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

  handleChannelCreated(payload: CreatedChannelPayload): void {
    const id =
      `${payload.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const newChannel: ChannelPreview = {
      id,
      name: payload.name,
      description: payload.description,
      memberIds: payload.memberIds
    };

    this.channels = [
      ...this.channels,
      newChannel
    ];

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
    return (
      this.channels.find(
        (channel) => channel.id === this.activeChannelId
      ) ?? this.channels[0]
    );
  }

  getActiveMember(): MemberPreview | null {
    if (!this.activeMemberId) {
      return null;
    }

    return (
      this.members.find(
        (member) => member.id === this.activeMemberId
      ) ?? null
    );
  }

  getActiveTitle(): string {
    const member = this.getActiveMember();

    return member
      ? member.name
      : `#${this.getActiveChannel().name}`;
  }

  getComposerPlaceholder(): string {
    const member = this.getActiveMember();

    if (!member) {
      return `Nachricht an #${this.getActiveChannel().name}`;
    }

    if (
      member.isCurrentUser ||
      member.id === this.currentUser.id
    ) {
      return 'Notiz an dich selbst...';
    }

    return `Nachricht an ${member.name}`;
  }

  addReaction(
    message: ChatMessagePreview,
    emoji: string
  ): void {
    if (!message.reactions) {
      message.reactions = [];
    }

    const existingReaction = message.reactions.find(
      (reaction) => reaction.emoji === emoji
    );

    if (existingReaction) {
      existingReaction.count++;
      return;
    }

    message.reactions.push({
      emoji,
      count: 1
    });
  }

  getCurrentMessages(): ChatMessagePreview[] {
    if (this.activeMemberId) {
      return this.directMessages[this.activeMemberId] ?? [];
    }

    return this.channelMessages[this.activeChannelId] ?? [];
  }
}