import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConversationRef } from '../../../models/message.model';
import { buildDirectChatId } from '../../../models/direct-chat.model';
import { ChannelPreview, MemberPreview } from '../../../models/view.models';
import { MessageHit, MessageService } from '../../../services/message.service';
import { WorkspaceStore } from '../../../services/workspace.store';

export interface SearchSelection {
  conversation: ConversationRef;
  memberId?: string;
}

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent implements OnDestroy {
  @Input() placeholder = 'Devspace durchsuchen';
  @Input() inputId = 'global-search';
  @Output() selected = new EventEmitter<SearchSelection>();

  private readonly store = inject(WorkspaceStore);
  private readonly messageService = inject(MessageService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private timer: ReturnType<typeof setTimeout> | null = null;

  term = '';
  hits: MessageHit[] = [];
  isSearching = false;
  isOpen = false;


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }


  get mode(): 'channels' | 'members' | 'messages' {
    if (this.term.startsWith('#')) {
      return 'channels';
    }
    return this.term.startsWith('@') ? 'members' : 'messages';
  }


  get query(): string {
    return this.term.replace(/^[#@]/, '').trim().toLowerCase();
  }


  get channelHits(): ChannelPreview[] {
    return this.store.channels().filter((c) => c.name.toLowerCase().includes(this.query));
  }


  get memberHits(): MemberPreview[] {
    return this.store.members().filter((m) => m.name.toLowerCase().includes(this.query));
  }


  onInput(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.hits = [];
    this.isOpen = true;
    if (this.mode === 'messages' && this.query.length >= 2) {
      this.timer = setTimeout(() => this.searchMessages(), 300);
    }
  }


  channelName(conversation: ConversationRef): string {
    if (conversation.type === 'channel') {
      return '#' + (this.store.channels().find((c) => c.id === conversation.id)?.name ?? '');
    }
    const otherId = conversation.id.split('_').find((id) => id !== this.store.uid()) ?? this.store.uid() ?? '';
    return this.store.userMap().get(otherId)?.name ?? 'Direktnachricht';
  }


  authorName(hit: MessageHit): string {
    return this.store.userMap().get(hit.message.authorId)?.name ?? 'Unbekannt';
  }


  pickChannel(channel: ChannelPreview): void {
    this.emit({ conversation: { type: 'channel', id: channel.id } });
  }


  pickMember(member: MemberPreview): void {
    const uid = this.store.uid() ?? '';
    this.emit({ conversation: { type: 'direct', id: buildDirectChatId(uid, member.id) }, memberId: member.id });
  }


  pickHit(hit: MessageHit): void {
    this.emit({ conversation: hit.conversation });
  }


  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }


  private async searchMessages(): Promise<void> {
    this.isSearching = true;
    const uid = this.store.uid() ?? '';
    const channels = this.store.channels().map((c) => ({ type: 'channel', id: c.id }) as ConversationRef);
    const directs = this.store.members().map((m) => ({ type: 'direct', id: buildDirectChatId(uid, m.id) }) as ConversationRef);
    this.hits = (await this.messageService.search([...channels, ...directs], this.query)).slice(0, 20);
    this.isSearching = false;
  }


  private emit(selection: SearchSelection): void {
    this.term = '';
    this.hits = [];
    this.selected.emit(selection);
  }
}
