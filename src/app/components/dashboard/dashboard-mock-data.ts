import { ChannelPreview, ChatMessagePreview, MemberPreview } from './dashboard.models';
import { ThreadMessage } from './thread-panel/thread-panel.component';

export const CURRENT_USER: MemberPreview = {
  id: 'frederik',
  name: 'Frederik Beck',
  avatar: 'assets/img/Frederik Beck.png',
  online: true,
  isCurrentUser: true
};

export const INITIAL_CHANNELS: ChannelPreview[] = [
  { id: 'entwicklerteam', name: 'Entwicklerteam' },
  { id: 'office-team', name: 'Office-team' }
];

export const INITIAL_MEMBERS: MemberPreview[] = [
  { id: 'frederik', name: 'Frederik Beck (Du)', avatar: 'assets/img/Frederik Beck.png', online: true, isCurrentUser: true },
  { id: 'sofia', name: 'Sofia Müller', avatar: 'assets/img/Sofia Müller.png', online: true },
  { id: 'noah', name: 'Noah Braun', avatar: 'assets/img/Noah Braun.png', online: true },
  { id: 'elise', name: 'Elise Roth', avatar: 'assets/img/Elise Roth.png', online: false },
  { id: 'elias', name: 'Elias Neumann', avatar: 'assets/img/Elias Neumann.png', online: true },
  { id: 'steffen', name: 'Steffen Hoffmann', avatar: 'assets/img/Steffen Hoffmann.png', online: false }
];

export const INITIAL_CHANNEL_AVATARS: string[] = [
  'assets/img/Sofia Müller.png',
  'assets/img/Noah Braun.png',
  'assets/img/Frederik Beck.png'
];

export const INITIAL_CHANNEL_MESSAGES: Record<string, ChatMessagePreview[]> = {
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
        { emoji: '🚀', count: 1 },
        { emoji: '✅', count: 2 }
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

export const INITIAL_DIRECT_MESSAGES: Record<string, ChatMessagePreview[]> = {
  'frederik': [],
  'sofia': [],
  'noah': [],
  'elise': [],
  'elias': [],
  'steffen': []
};

export const INITIAL_THREAD_ROOT: ThreadMessage = {
  id: 'm1',
  author: 'Noah Braun',
  avatar: 'assets/img/Noah Braun.png',
  time: '14:25 Uhr',
  text: 'Welche Version von Angular nutzen wir aktuell für das DABubble-Projekt?',
  isOwn: false
};

export const INITIAL_THREAD_REPLIES: ThreadMessage[] = [
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
