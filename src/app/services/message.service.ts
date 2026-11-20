import { Injectable, inject } from '@angular/core';
import {
  CollectionReference, FieldPath, Firestore, addDoc, arrayRemove, arrayUnion,
  collection, collectionData, doc, getDocs, increment, orderBy, query, setDoc, updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { buildDirectChatId } from '../models/direct-chat.model';
import { ConversationRef, Message } from '../models/message.model';

export interface MessageHit {
  conversation: ConversationRef;
  message: Message;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly firestore = inject(Firestore);


  messages$(conversation: ConversationRef): Observable<Message[]> {
    const ordered = query(this.messagesRef(conversation), orderBy('createdAt'));
    return collectionData(ordered, { idField: 'id' }) as Observable<Message[]>;
  }


  thread$(conversation: ConversationRef, messageId: string): Observable<Message[]> {
    const ordered = query(this.threadRef(conversation, messageId), orderBy('createdAt'));
    return collectionData(ordered, { idField: 'id' }) as Observable<Message[]>;
  }


  async send(conversation: ConversationRef, text: string, authorId: string): Promise<void> {
    await addDoc(this.messagesRef(conversation), this.buildMessage(text, authorId));
  }


  async reply(conversation: ConversationRef, messageId: string, text: string, authorId: string): Promise<void> {
    const reply = this.buildMessage(text, authorId);
    await addDoc(this.threadRef(conversation, messageId), reply);
    await updateDoc(this.messageDoc(conversation, messageId), {
      threadCount: increment(1), lastThreadAt: reply.createdAt
    });
  }


  edit(conversation: ConversationRef, messageId: string, text: string, parentId: string | null = null): Promise<void> {
    return updateDoc(this.messageDoc(conversation, messageId, parentId), { text: text.trim(), editedAt: Date.now() });
  }


  setReaction(
    conversation: ConversationRef, messageId: string, emoji: string, uid: string, active: boolean, parentId: string | null = null
  ): Promise<void> {
    const change = active ? arrayUnion(uid) : arrayRemove(uid);
    return updateDoc(this.messageDoc(conversation, messageId, parentId), new FieldPath('reactions', emoji), change);
  }


  async openDirectChat(uidA: string, uidB: string): Promise<ConversationRef> {
    const id = buildDirectChatId(uidA, uidB);
    await setDoc(doc(this.firestore, 'directChats', id), { id, memberIds: [uidA, uidB] }, { merge: true });
    return { type: 'direct', id };
  }


  async search(conversations: ConversationRef[], term: string): Promise<MessageHit[]> {
    const needle = term.trim().toLowerCase();
    if (!needle) {
      return [];
    }
    const perConversation = await Promise.all(conversations.map((c) => this.searchIn(c, needle)));
    return perConversation.flat();
  }


  private async searchIn(conversation: ConversationRef, needle: string): Promise<MessageHit[]> {
    const snapshot = await getDocs(this.messagesRef(conversation));
    return snapshot.docs
      .map((d) => ({ ...(d.data() as Message), id: d.id }))
      .filter((message) => message.text.toLowerCase().includes(needle))
      .map((message) => ({ conversation, message }));
  }


  private buildMessage(text: string, authorId: string): Omit<Message, 'id'> {
    return {
      text: text.trim(), authorId, createdAt: Date.now(), editedAt: null,
      reactions: {}, threadCount: 0, lastThreadAt: null
    };
  }


  private basePath(conversation: ConversationRef): string {
    const root = conversation.type === 'channel' ? 'channels' : 'directChats';
    return `${root}/${conversation.id}/messages`;
  }


  private messagesRef(conversation: ConversationRef): CollectionReference {
    return collection(this.firestore, this.basePath(conversation));
  }


  private threadRef(conversation: ConversationRef, messageId: string): CollectionReference {
    return collection(this.firestore, `${this.basePath(conversation)}/${messageId}/thread`);
  }


  private messageDoc(conversation: ConversationRef, messageId: string, parentId: string | null = null) {
    const path = parentId ? `${parentId}/thread/${messageId}` : messageId;
    return doc(this.firestore, `${this.basePath(conversation)}/${path}`);
  }
}
