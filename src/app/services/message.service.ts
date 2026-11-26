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
  threadParentId?: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly firestore = inject(Firestore);


  /** Streams the messages of a conversation ordered by creation time. */
  messages$(conversation: ConversationRef): Observable<Message[]> {
    const ordered = query(this.messagesRef(conversation), orderBy('createdAt'));
    return collectionData(ordered, { idField: 'id' }) as Observable<Message[]>;
  }


  /** Streams the replies of a message thread ordered by creation time. */
  thread$(conversation: ConversationRef, messageId: string): Observable<Message[]> {
    const ordered = query(this.threadRef(conversation, messageId), orderBy('createdAt'));
    return collectionData(ordered, { idField: 'id' }) as Observable<Message[]>;
  }


  /** Adds a new message to the conversation. */
  async send(conversation: ConversationRef, text: string, authorId: string): Promise<void> {
    await addDoc(this.messagesRef(conversation), this.buildMessage(text, authorId));
  }


  /** Adds a reply to a message thread and updates the thread counter of the parent message. */
  async reply(conversation: ConversationRef, messageId: string, text: string, authorId: string): Promise<void> {
    const reply = this.buildMessage(text, authorId);
    await addDoc(this.threadRef(conversation, messageId), reply);
    await updateDoc(this.messageDoc(conversation, messageId), {
      threadCount: increment(1), lastThreadAt: reply.createdAt
    });
  }


  /** Updates the text of a message or thread reply and marks it as edited. */
  edit(conversation: ConversationRef, messageId: string, text: string, parentId: string | null = null): Promise<void> {
    return updateDoc(this.messageDoc(conversation, messageId, parentId), { text: text.trim(), editedAt: Date.now() });
  }


  /** Adds or removes the user's reaction with the given emoji on a message or thread reply. */
  setReaction(
    conversation: ConversationRef, messageId: string, emoji: string, uid: string, active: boolean, parentId: string | null = null
  ): Promise<void> {
    const change = active ? arrayUnion(uid) : arrayRemove(uid);
    return updateDoc(this.messageDoc(conversation, messageId, parentId), new FieldPath('reactions', emoji), change);
  }


  /** Creates the direct chat of two users if needed and returns its reference. */
  async openDirectChat(uidA: string, uidB: string): Promise<ConversationRef> {
    const id = buildDirectChatId(uidA, uidB);
    await setDoc(doc(this.firestore, 'directChats', id), { id, memberIds: [uidA, uidB] }, { merge: true });
    return { type: 'direct', id };
  }


  /** Searches the given conversations for messages containing the term (case-insensitive). */
  async search(conversations: ConversationRef[], term: string): Promise<MessageHit[]> {
    const needle = term.trim().toLowerCase();
    if (!needle) {
      return [];
    }
    const perConversation = await Promise.all(conversations.map((c) => this.searchIn(c, needle)));
    return perConversation.flat();
  }


  /** Returns the messages and thread replies of one conversation that contain the search text; unreadable conversations yield no hits. */
  private async searchIn(conversation: ConversationRef, needle: string): Promise<MessageHit[]> {
    const messages = await this.readAll(this.messagesRef(conversation));
    const hits = messages.filter((m) => m.text.toLowerCase().includes(needle)).map((message) => ({ conversation, message }));
    const withThreads = messages.filter((m) => m.threadCount > 0);
    const threadHits = await Promise.all(withThreads.map((m) => this.searchThread(conversation, m.id, needle)));
    return [...hits, ...threadHits.flat()];
  }


  /** Returns the replies of one thread that contain the search text. */
  private async searchThread(conversation: ConversationRef, parentId: string, needle: string): Promise<MessageHit[]> {
    const replies = await this.readAll(this.threadRef(conversation, parentId));
    return replies
      .filter((reply) => reply.text.toLowerCase().includes(needle))
      .map((message) => ({ conversation, message, threadParentId: parentId }));
  }


  /** Reads all messages of a collection once; a denied read yields an empty list. */
  private async readAll(ref: CollectionReference): Promise<Message[]> {
    const snapshot = await getDocs(ref).catch(() => null);
    return snapshot ? snapshot.docs.map((d) => ({ ...(d.data() as Message), id: d.id })) : [];
  }


  /** Builds the initial data of a new message. */
  private buildMessage(text: string, authorId: string): Omit<Message, 'id'> {
    return {
      text: text.trim(), authorId, createdAt: Date.now(), editedAt: null,
      reactions: {}, threadCount: 0, lastThreadAt: null
    };
  }


  /** Returns the Firestore path of the messages collection of a conversation. */
  private basePath(conversation: ConversationRef): string {
    const root = conversation.type === 'channel' ? 'channels' : 'directChats';
    return `${root}/${conversation.id}/messages`;
  }


  /** Returns the messages collection of a conversation. */
  private messagesRef(conversation: ConversationRef): CollectionReference {
    return collection(this.firestore, this.basePath(conversation));
  }


  /** Returns the thread collection of a message. */
  private threadRef(conversation: ConversationRef, messageId: string): CollectionReference {
    return collection(this.firestore, `${this.basePath(conversation)}/${messageId}/thread`);
  }


  /** Returns the document of a message, or of a thread reply when a parent id is given. */
  private messageDoc(conversation: ConversationRef, messageId: string, parentId: string | null = null) {
    const path = parentId ? `${parentId}/thread/${messageId}` : messageId;
    return doc(this.firestore, `${this.basePath(conversation)}/${path}`);
  }
}
