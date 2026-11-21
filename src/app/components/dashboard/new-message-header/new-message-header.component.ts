import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelPreview, MemberPreview } from '../../../models/view.models';

export interface Recipient {
  kind: 'channel' | 'member';
  id: string;
  label: string;
}

@Component({
  selector: 'app-new-message-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-message-header.component.html',
  styleUrl: './new-message-header.component.scss'
})
export class NewMessageHeaderComponent {
  @Input() channels: ChannelPreview[] = [];
  @Input() members: MemberPreview[] = [];
  @Input() recipient: Recipient | null = null;
  @Output() recipientChange = new EventEmitter<Recipient | null>();

  term = '';


  get options(): Recipient[] {
    const term = this.term.trim().toLowerCase();
    if (!term) {
      return [];
    }
    const query = term.replace(/^[#@]/, '');
    return [...this.channelOptions(term, query), ...this.memberOptions(term, query)].slice(0, 8);
  }


  pick(recipient: Recipient): void {
    this.term = '';
    this.recipientChange.emit(recipient);
  }


  clear(): void {
    this.recipientChange.emit(null);
  }


  private channelOptions(term: string, query: string): Recipient[] {
    if (term.startsWith('@')) {
      return [];
    }
    return this.channels
      .filter((c) => c.name.toLowerCase().includes(query))
      .map((c) => ({ kind: 'channel', id: c.id, label: '# ' + c.name }));
  }


  private memberOptions(term: string, query: string): Recipient[] {
    if (term.startsWith('#')) {
      return [];
    }
    return this.members
      .filter((m) => m.name.toLowerCase().includes(query) || (m.email ?? '').toLowerCase().includes(query))
      .map((m) => ({ kind: 'member', id: m.id, label: '@' + m.name }));
  }
}
