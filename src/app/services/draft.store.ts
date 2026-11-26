import { Injectable, signal } from '@angular/core';

/** Unsent message drafts per conversation, like Slack: kept when switching chats, cleared on send or logout. */
@Injectable({ providedIn: 'root' })
export class DraftStore {
  private readonly drafts = signal<Record<string, string>>({});


  /** Returns the draft for the conversation key, or an empty string. */
  get(key: string | null): string {
    return key ? this.drafts()[key] ?? '' : '';
  }


  /** Stores the text for the conversation key; blank text removes the draft. */
  set(key: string | null, text: string): void {
    if (!key) return;
    this.drafts.update((all) => {
      const { [key]: _removed, ...rest } = all;
      return text.trim() ? { ...rest, [key]: text } : rest;
    });
  }


  /** Checks whether the conversation key has an unsent draft. */
  has(key: string): boolean {
    return key in this.drafts();
  }


  /** Removes all drafts, e.g. on logout. */
  clear(): void {
    this.drafts.set({});
  }
}
