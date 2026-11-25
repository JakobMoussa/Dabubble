import { Injectable, inject } from '@angular/core';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { UserService } from './user.service';
import { WorkspaceStore } from './workspace.store';

/** Write operations of the workspace, always applied to the active chat of the store. */
@Injectable({ providedIn: 'root' })
export class WorkspaceActions {
  private readonly store = inject(WorkspaceStore);
  private readonly messages = inject(MessageService);
  private readonly channels = inject(ChannelService);
  private readonly users = inject(UserService);


  /** Sends a message to the active conversation. */
  async send(text: string): Promise<void> {
    const conversation = this.store.active();
    const uid = this.store.uid();
    if (conversation && uid && text.trim()) {
      await this.messages.send(conversation, text, uid);
    }
  }


  /** Opens the target channel or direct chat and sends the message there. */
  async sendTo(target: { kind: 'channel' | 'member'; id: string }, text: string): Promise<void> {
    if (target.kind === 'channel') {
      this.store.openChannel(target.id);
    } else {
      await this.store.openDirect(target.id);
    }
    await this.send(text);
  }


  /** Replies to the open thread of the active conversation. */
  async reply(text: string): Promise<void> {
    const conversation = this.store.active();
    const parentId = this.store.threadParentId();
    const uid = this.store.uid();
    if (conversation && parentId && uid && text.trim()) {
      await this.messages.reply(conversation, parentId, text, uid);
    }
  }


  /** Adds or removes the current user's reaction on a message or thread reply. */
  async react(messageId: string, emoji: string, active: boolean, inThread: boolean): Promise<void> {
    const conversation = this.store.active();
    const uid = this.store.uid();
    if (conversation && uid) {
      const parentId = inThread ? this.store.threadParentId() : null;
      await this.messages.setReaction(conversation, messageId, emoji, uid, active, parentId);
    }
  }


  /** Edits a message or thread reply in the active conversation. */
  async edit(messageId: string, text: string, inThread: boolean): Promise<void> {
    const conversation = this.store.active();
    if (conversation) {
      const parentId = inThread ? this.store.threadParentId() : null;
      await this.messages.edit(conversation, messageId, text, parentId);
    }
  }


  /** Creates a channel, adds the given members and opens it. */
  async createChannel(name: string, description: string, memberIds: string[]): Promise<void> {
    const uid = this.store.uid();
    if (!uid) {
      return;
    }
    const channelId = await this.channels.create(name, description, uid);
    if (memberIds.length) {
      await this.channels.addMembers(channelId, memberIds);
    }
    this.store.openChannel(channelId);
  }


  /** Updates name and description of a channel. */
  updateChannel(channelId: string, name: string, description: string): Promise<void> {
    return this.channels.rename(channelId, name, description);
  }


  /** Adds the given users to a channel. */
  addMembers(channelId: string, memberIds: string[]): Promise<void> {
    return this.channels.addMembers(channelId, memberIds);
  }


  /** Removes the current user from the channel and closes the active chat. */
  async leaveChannel(channelId: string): Promise<void> {
    const uid = this.store.uid();
    if (uid) {
      await this.channels.leave(channelId, uid);
      this.store.active.set(null);
    }
  }


  /** Updates name and avatar of the current user. */
  async updateProfile(name: string, avatar: string): Promise<void> {
    const uid = this.store.uid();
    if (uid) {
      await this.users.updateProfile(uid, { name: name.trim(), avatar });
    }
  }
}
