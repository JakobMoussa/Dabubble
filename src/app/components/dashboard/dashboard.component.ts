import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AddChannelModalComponent,
  CreatedChannelPayload
} from './add-channel-modal/add-channel-modal.component';
import { ThreadMessage, ThreadPanelComponent } from './thread-panel/thread-panel.component';

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
  imports: [CommonModule, RouterLink, ThreadPanelComponent, AddChannelModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  isSidebarHidden = false;
  isChannelPopupOpen = false;
  isThreadOpen = true;
  isChannelsOpen = true;
  isDirectMessagesOpen = true;
  mobileView: 'menu' | 'chat' | 'thread' = 'menu';

  activeChannelId = 'entwicklerteam';
  activeMemberId: string | null = null;

  readonly currentUser: MemberPreview = {
    id: 'frederik',
    name: 'Frederik Beck',
    avatar: 'assets/img/Frederik Beck.png',
    online: true,
    isCurrentUser: true
  };

  channels: ChannelPreview[] = [
    { id: 'entwicklerteam', name: 'Entwicklerteam' },
    { id: 'office-team', name: 'Office-team' }
  ];

  readonly members: MemberPreview[] = [
    { id: 'frederik', name: 'Frederik Beck (Du)', avatar: 'assets/img/Frederik Beck.png', online: true, isCurrentUser: true },
    { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/img/Sofia Müller.png', online: true },
    { id: 'noah', name: 'Noah Braun', avatar: 'assets/img/Noah Braun.png', online: true },
    { id: 'elise', name: 'Elise Roth', avatar: 'assets/img/Elise Roth.png', online: false },
    { id: 'elias', name: 'Elias Neumann', avatar: 'assets/img/Elias Neumann.png', online: true },
    { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/img/Steffen Hoffmann.png', online: false }
  ];

  readonly channelMemberAvatars: string[] = [
    'assets/img/Sofia Müller.png',
    'assets/img/Noah Braun.png',
    'assets/img/Frederik Beck.png'
  ];

  readonly sampleMessages: ChatMessagePreview[] = [
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
        { emoji: '🚀', count: 1 },
        { emoji: '✅', count: 2 }
      ]
    }
  ];


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
      reactions: [{ emoji: '👍', count: 1 }]
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
  }


  selectMember(memberId: string): void {
    this.activeMemberId = memberId;
    this.mobileView = 'chat';
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
}
