import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelPreview, MemberPreview } from '../../../models/view.models';
import { EmojiPickerComponent } from '../../../shared/components/emoji-picker/emoji-picker.component';

interface MentionOption {
  key: string;
  label: string;
  avatar?: string;
  insert: string;
}

const TOKEN_PATTERN = /(^|\s)([@#])([^\s@#]*)$/;

@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [FormsModule, EmojiPickerComponent],
  templateUrl: './message-composer.component.html',
  styleUrl: './message-composer.component.scss'
})
export class MessageComposerComponent {
  @Input() placeholder = 'Nachricht schreiben';
  @Input() inputId = 'chat-message-input';
  @Input() members: MemberPreview[] = [];
  @Input() channels: ChannelPreview[] = [];
  @Input() compact = false;
  @Output() sent = new EventEmitter<string>();
  @ViewChild('field') private field!: ElementRef<HTMLTextAreaElement>;

  text = '';
  isEmojiOpen = false;
  options: MentionOption[] = [];
  activeIndex = 0;


  /** Updates the mention suggestions based on the token before the caret. */
  onInput(): void {
    const match = TOKEN_PATTERN.exec(this.textBeforeCaret());
    this.options = match ? this.findOptions(match[2], match[3].toLowerCase()) : [];
    this.activeIndex = 0;
  }


  /** Handles list navigation keys and sends the message on Enter without Shift. */
  onKeydown(event: KeyboardEvent): void {
    if (this.options.length && this.handleListKey(event)) {
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }


  /** Inserts an @ at the caret and opens the member suggestions. */
  startMention(): void {
    this.insertAtCaret(this.needsSpace() ? ' @' : '@');
    this.onInput();
  }


  /** Closes the emoji picker and inserts the chosen emoji at the caret. */
  addEmoji(emoji: string): void {
    this.isEmojiOpen = false;
    this.insertAtCaret(emoji);
  }


  /** Toggles the emoji picker without propagating the click event. */
  toggleEmoji(event: Event): void {
    event.stopPropagation();
    this.isEmojiOpen = !this.isEmojiOpen;
  }


  /** Replaces the typed token with the chosen mention and moves the caret behind it. */
  choose(option: MentionOption): void {
    const before = this.textBeforeCaret().replace(TOKEN_PATTERN, `$1${option.insert} `);
    const after = this.text.slice(this.caret());
    this.text = before + after;
    this.options = [];
    this.focusAt(before.length);
  }


  /** Emits the trimmed message text and resets the input and suggestions if it is not empty. */
  send(): void {
    const text = this.text.trim();
    if (text) {
      this.sent.emit(text);
      this.text = '';
      this.options = [];
    }
  }


  /** Focuses the text field. */
  focus(): void {
    this.field?.nativeElement.focus();
  }


  /** Returns up to eight member or channel suggestions matching the typed term. */
  private findOptions(trigger: string, term: string): MentionOption[] {
    const source = trigger === '@'
      ? this.members.map((m) => ({ key: m.id, label: m.name, avatar: m.avatar, insert: '@' + m.name.replace(' (Du)', '') }))
      : this.channels.map((c) => ({ key: c.id, label: '# ' + c.name, insert: '#' + c.name }));
    return source.filter((o) => o.insert.toLowerCase().includes(term)).slice(0, 8);
  }


  /** Handles arrow, Enter, Tab and Escape keys for the suggestion list and returns whether the key was handled. */
  private handleListKey(event: KeyboardEvent): boolean {
    const keys: Record<string, () => void> = {
      ArrowDown: () => (this.activeIndex = (this.activeIndex + 1) % this.options.length),
      ArrowUp: () => (this.activeIndex = (this.activeIndex - 1 + this.options.length) % this.options.length),
      Enter: () => this.choose(this.options[this.activeIndex]),
      Tab: () => this.choose(this.options[this.activeIndex]),
      Escape: () => (this.options = [])
    };
    keys[event.key]?.();
    return event.key in keys;
  }


  /** Inserts text at the caret position and moves the caret behind it. */
  private insertAtCaret(value: string): void {
    const position = this.caret();
    this.text = this.text.slice(0, position) + value + this.text.slice(position);
    this.focusAt(position + value.length);
  }


  /** Focuses the text field and sets the caret to the given position after rendering. */
  private focusAt(position: number): void {
    setTimeout(() => {
      const el = this.field.nativeElement;
      el.focus();
      el.setSelectionRange(position, position);
    }, 0);
  }


  /** Returns the caret position, or the text length if the field is unavailable. */
  private caret(): number {
    return this.field?.nativeElement.selectionStart ?? this.text.length;
  }


  /** Returns the text before the caret position. */
  private textBeforeCaret(): string {
    return this.text.slice(0, this.caret());
  }


  /** Checks whether a space is needed before inserting a mention at the caret. */
  private needsSpace(): boolean {
    const before = this.textBeforeCaret();
    return before.length > 0 && !/\s$/.test(before);
  }
}
