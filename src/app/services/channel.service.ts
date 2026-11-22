import { Injectable, inject } from '@angular/core';
import {
  Firestore, addDoc, arrayRemove, arrayUnion, collection, collectionData,
  doc, getDocs, query, updateDoc, where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.model';

const CHANNELS = 'channels';

export class DuplicateChannelError extends Error {
  constructor() {
    super('*Ein Channel mit diesem Namen existiert bereits.');
  }
}

@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly firestore = inject(Firestore);
  private readonly channels = collection(this.firestore, CHANNELS);


  channelsOf$(uid: string): Observable<Channel[]> {
    const mine = query(this.channels, where('memberIds', 'array-contains', uid));
    return collectionData(mine, { idField: 'id' }) as Observable<Channel[]>;
  }


  async create(name: string, description: string, creatorId: string): Promise<string> {
    await this.assertNameIsFree(name);
    const channel: Omit<Channel, 'id'> = {
      name: name.trim(), nameLower: name.trim().toLowerCase(), description: description.trim(),
      createdBy: creatorId, memberIds: [creatorId], createdAt: Date.now()
    };
    const ref = await addDoc(this.channels, channel);
    return ref.id;
  }


  async rename(channelId: string, name: string, description: string): Promise<void> {
    await this.assertNameIsFree(name, channelId);
    await updateDoc(doc(this.firestore, CHANNELS, channelId), {
      name: name.trim(), nameLower: name.trim().toLowerCase(), description: description.trim()
    });
  }


  addMembers(channelId: string, uids: string[]): Promise<void> {
    return updateDoc(doc(this.firestore, CHANNELS, channelId), { memberIds: arrayUnion(...uids) });
  }


  leave(channelId: string, uid: string): Promise<void> {
    return updateDoc(doc(this.firestore, CHANNELS, channelId), { memberIds: arrayRemove(uid) });
  }


  async joinDefaultChannels(uid: string): Promise<void> {
    const defaults = await getDocs(query(this.channels, where('isDefault', '==', true)));
    await Promise.all(defaults.docs.map((d) => this.addMembers(d.id, [uid])));
  }


  private async assertNameIsFree(name: string, ownId?: string): Promise<void> {
    const sameName = query(this.channels, where('nameLower', '==', name.trim().toLowerCase()));
    const result = await getDocs(sameName);
    if (result.docs.some((snapshot) => snapshot.id !== ownId)) {
      throw new DuplicateChannelError();
    }
  }
}
