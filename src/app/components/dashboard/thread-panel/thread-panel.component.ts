import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChannelPreview, ChatMessagePreview, MemberPreview } from '../../../models/view.models';
import { ChatMessageComponent, ReactionToggle } from '../chat-message/chat-message.component';
import { MessageComposerComponent } from '../message-composer/message-composer.component';

export type ThreadMessage = ChatMessagePreview;

@Component({
  selector: 'app-thread-panel',
  standalone: true,
  imports: [ChatMessageComponent, MessageComposerComponent],
  templateUrl: './thread-panel.component.html',
  styleUrl: './thread-panel.component.scss'
})
export class ThreadPanelComponent {
  @Input({ required: true }) channelName = '';
  @Input({ required: true }) rootMessage!: ThreadMessage;
  @Input() replies: ThreadMessage[] = [];
  @Input() members: MemberPreview[] = [];
  @Input() channels: ChannelPreview[] = [];
  @Input() currentUid: string | null = null;
  @Input() userNames = new Map<string, string>();
  @Output() closeThread = new EventEmitter<void>();
  @Output() replySent = new EventEmitter<string>();
  @Output() reactionToggled = new EventEmitter<ReactionToggle>();
  @Output() rootReaction = new EventEmitter<ReactionToggle>();
  @Output() edited = new EventEmitter<{ messageId: string; text: string }>();


  /** Reply count; uses the stored counter until the replies have loaded, so it never flashes 0. */
  get replyCount(): number {
    return Math.max(this.replies.length, this.rootMessage.repliesCount ?? 0);
  }


  /** Emits that the thread should be closed. */
  onClose(): void {
    this.closeThread.emit();
  }
}
