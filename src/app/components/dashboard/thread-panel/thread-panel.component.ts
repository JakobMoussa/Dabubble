import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ThreadMessage {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  isOwn: boolean;
  reactions?: { emoji: string; count: number }[];
}

@Component({
  selector: 'app-thread-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thread-panel.component.html',
  styleUrl: './thread-panel.component.scss'
})
export class ThreadPanelComponent {
  @Input({ required: true }) channelName = '';
  @Input({ required: true }) rootMessage!: ThreadMessage;
  @Input() replies: ThreadMessage[] = [];
  @Output() closeThread = new EventEmitter<void>();


  onClose(): void {
    this.closeThread.emit();
  }
}
