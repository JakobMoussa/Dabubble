import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessagePreview } from '../../../models/view.models';
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
  @Input() compact = false;
  @Input() showThreadLink = true;
  @Output() reactionToggled = new EventEmitter<ReactionToggle>();
  @Output() threadOpened = new EventEmitter<string>();
  @Output() edited = new EventEmitter<{ messageId: string; text: string }>();
  @Output() authorClicked = new EventEmitter<string>();

  isPickerOpen = false;
  isMenuOpen = false;
  isEditing = false;
  showAll = false;
  editText = '';
  quickEmojis = readRecentEmojis();


  get reactionLimit(): number {
    return this.compact || window.innerWidth < 768 ? MAX_REACTIONS_COMPACT : MAX_REACTIONS_DESKTOP;
  }


  get visibleReactions(): { visible: ReactionView[]; hidden: number } {
    const all = this.message.reactions ?? [];
    return this.showAll ? { visible: all, hidden: 0 } : limitReactions(all, this.reactionLimit);
  }


  hasReacted(reaction: ReactionView): boolean {
    return !!this.currentUid && reaction.userIds.includes(this.currentUid);
  }


  /** Lists who reacted as "A, B und C", with the current user ("Du") last. */
  reactedBy(reaction: ReactionView): string {
    const others = reaction.userIds.filter((id) => id !== this.currentUid).map((id) => this.userNames.get(id) ?? 'Unbekannt');
    const names = this.hasReacted(reaction) ? [...others, 'Du'] : others;
    return names.length > 1 ? `${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}` : names.join('');
  }


  reactedVerb(reaction: ReactionView): string {
    if (reaction.userIds.length > 1) {
      return 'haben reagiert';
    }
    return reaction.userIds[0] === this.currentUid ? 'hast reagiert' : 'hat reagiert';
  }


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


  openPicker(event: Event): void {
    event.stopPropagation();
    this.isPickerOpen = !this.isPickerOpen;
  }


  startEditing(): void {
    this.isMenuOpen = false;
    this.editText = this.message.text;
    this.isEditing = true;
  }


  saveEdit(): void {
    const text = this.editText.trim();
    if (text && text !== this.message.text) {
      this.edited.emit({ messageId: this.message.id, text });
    }
    this.isEditing = false;
  }
}
