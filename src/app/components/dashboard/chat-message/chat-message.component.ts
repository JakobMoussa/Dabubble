import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessagePreview } from '../../../models/view.models';
import { MentionTarget, MessagePart, splitMentions } from '../../../shared/mention-parts';
import { EmojiPickerComponent } from '../../../shared/components/emoji-picker/emoji-picker.component';
import {
  MAX_REACTIONS_COMPACT, MAX_REACTIONS_DESKTOP, ReactionView, limitReactions, readRecentEmojis, rememberEmoji
} from '../../../shared/reactions';

export interface ReactionToggle {
  messageId: string;
  emoji: string;
  active: boolean;
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [FormsModule, EmojiPickerComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  @Input({ required: true }) message!: ChatMessagePreview;
  @Input() currentUid: string | null = null;
  @Input() userNames = new Map<string, string>();
  @Input() channelNames = new Map<string, string>();
  @Input() compact = false;
  @Input() showThreadLink = true;
  @Output() reactionToggled = new EventEmitter<ReactionToggle>();
  @Output() threadOpened = new EventEmitter<string>();
  @Output() edited = new EventEmitter<{ messageId: string; text: string }>();
  @Output() authorClicked = new EventEmitter<string>();
  @Output() mentionClicked = new EventEmitter<MentionTarget>();

  isPickerOpen = false;
  isMenuOpen = false;
  isEditing = false;
  showAll = false;
  editText = '';
  quickEmojis = readRecentEmojis();


  /** Message text split into plain text and clickable @- and #-mentions. */
  get textParts(): MessagePart[] {
    return splitMentions(this.message.text, this.userNames, this.channelNames);
  }


  /** Maximum number of reactions shown before collapsing, depending on screen size. */
  get reactionLimit(): number {
    return this.compact || window.innerWidth < 768 ? MAX_REACTIONS_COMPACT : MAX_REACTIONS_DESKTOP;
  }


  /** Reactions to display and the count of hidden ones. */
  get visibleReactions(): { visible: ReactionView[]; hidden: number } {
    const all = this.message.reactions ?? [];
    return this.showAll ? { visible: all, hidden: 0 } : limitReactions(all, this.reactionLimit);
  }


  /** Whether the current user has given the reaction. */
  hasReacted(reaction: ReactionView): boolean {
    return !!this.currentUid && reaction.userIds.includes(this.currentUid);
  }


  /** Lists who reacted as "A, B und C", with the current user ("Du") last. */
  reactedBy(reaction: ReactionView): string {
    const others = reaction.userIds.filter((id) => id !== this.currentUid).map((id) => this.userNames.get(id) ?? 'Unbekannt');
    const names = this.hasReacted(reaction) ? [...others, 'Du'] : others;
    return names.length > 1 ? `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}` : names.join('');
  }


  /** Verb phrase matching the number of reacting users and whether the current user is among them. */
  reactedVerb(reaction: ReactionView): string {
    if (reaction.userIds.length > 1) {
      return 'haben reagiert';
    }
    return reaction.userIds[0] === this.currentUid ? 'hast reagiert' : 'hat reagiert';
  }


  /** Toggles the current user's reaction with the emoji and emits the change. */
  toggleReaction(emoji: string): void {
    const existing = this.message.reactions?.find((r) => r.emoji === emoji);
    const active = !existing || !this.hasReacted(existing);
    if (active) {
      rememberEmoji(emoji);
      this.quickEmojis = readRecentEmojis();
    }
    this.isPickerOpen = false;
    this.reactionToggled.emit({ messageId: this.message.id, emoji, active });
  }


  /** Toggles the emoji picker. */
  openPicker(event: Event): void {
    event.stopPropagation();
    this.isPickerOpen = !this.isPickerOpen;
  }


  /** Switches the message into edit mode. */
  startEditing(): void {
    this.isMenuOpen = false;
    this.editText = this.message.text;
    this.isEditing = true;
  }


  /** Emits the edited text if it changed and leaves edit mode. */
  saveEdit(): void {
    const text = this.editText.trim();
    if (text && text !== this.message.text) {
      this.edited.emit({ messageId: this.message.id, text });
    }
    this.isEditing = false;
  }
}
