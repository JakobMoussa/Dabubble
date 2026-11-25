import { Pipe, PipeTransform } from '@angular/core';
import { ChatMessagePreview } from '../models/view.models';
import { formatDay } from './message-view';

@Pipe({ name: 'dayLabel', standalone: true })
export class DayLabelPipe implements PipeTransform {
  /** Returns the day label for the message at the index, or an empty string if the previous message is from the same day. */
  transform(messages: ChatMessagePreview[], index: number): string {
    const current = new Date(messages[index].createdAt).toDateString();
    const previous = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
    return current === previous ? '' : formatDay(messages[index].createdAt);
  }
}
