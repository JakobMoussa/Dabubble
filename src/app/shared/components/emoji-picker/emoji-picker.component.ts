import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { EMOJI_CHOICES } from '../../emojis';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  template: `
    <div class="emoji-picker" role="listbox" aria-label="Emoji auswählen" (click)="$event.stopPropagation()">
      @for (emoji of emojis; track emoji) {
        <button type="button" class="emoji-picker__item" role="option" [attr.aria-label]="emoji"
          (click)="picked.emit(emoji)">{{ emoji }}</button>
      }
    </div>
  `,
  styles: [`
    :host { position: absolute; z-index: 20; }
    .emoji-picker {
      display: grid; grid-template-columns: repeat(5, 40px); gap: 4px; padding: 12px;
      background: var(--white); border: 1px solid var(--light-purple);
      border-radius: 20px 20px 20px 0; box-shadow: 0 6px 10px rgba(0, 0, 0, .2);
    }
    .emoji-picker__item {
      width: 40px; height: 40px; border-radius: 50%; font-size: 22px; cursor: pointer;
      border: none; background: transparent; transition: background-color 80ms ease-in;
    }
    .emoji-picker__item:hover, .emoji-picker__item:focus-visible { background: var(--bg-color); }
  `]
})
export class EmojiPickerComponent {
  readonly emojis = EMOJI_CHOICES;
  @Output() picked = new EventEmitter<string>();
  @Output() dismissed = new EventEmitter<void>();


  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  onOutsideClick(): void {
    this.dismissed.emit();
  }
}
