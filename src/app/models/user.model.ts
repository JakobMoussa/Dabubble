export type PresenceStatus = 'online' | 'away' | 'offline';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  status: PresenceStatus;
  isGuest: boolean;
  lastSeen?: number;
}
