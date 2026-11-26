import { MentionTarget } from '../../../shared/mention-parts';
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
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
export class ThreadPanelComponent implements AfterViewInit {
  @Input({ required: true }) channelName = '';
  @Input({ required: true }) rootMessage!: ThreadMessage;
  @Input() replies: ThreadMessage[] = [];
  @Input() members: MemberPreview[] = [];
  @Input() channels: ChannelPreview[] = [];
  @Input() currentUid: string | null = null;
  @Input() userNames = new Map<string, string>();
  @Input() channelNames = new Map<string, string>();
  @Output() closeThread = new EventEmitter<void>();
  @Output() replySent = new EventEmitter<string>();
  @Output() reactionToggled = new EventEmitter<ReactionToggle>();
  @Output() rootReaction = new EventEmitter<ReactionToggle>();
  @Output() edited = new EventEmitter<{ messageId: string; text: string }>();
  @Output() mentionClicked = new EventEmitter<MentionTarget>();


  /** Focuses the reply field once the thread is rendered, also when it opens from a search hit. */
  ngAfterViewInit(): void {
    document.getElementById('thread-reply-input')?.focus();
  }


  /** Reply count; uses the stored counter until the replies have loaded, so it never flashes 0. */
  get replyCount(): number {
    return Math.max(this.replies.length, this.rootMessage.repliesCount ?? 0);
  }


  /** Emits that the thread should be closed. */
  onClose(): void {
    this.closeThread.emit();
  }
}
