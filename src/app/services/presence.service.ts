import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

/** Keeps the signed-in user's status in sync with tab visibility (online, away, offline). */
@Injectable({ providedIn: 'root' })
export class PresenceService {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private uid: string | null = null;


  /** Starts tracking the sign-in state, tab visibility and page unload until the given ref is destroyed. */
  start(destroyRef: DestroyRef): void {
    this.auth.user$.pipe(takeUntilDestroyed(destroyRef)).subscribe((user) => {
      this.uid = user?.uid ?? null;
      this.update(document.visibilityState === 'visible' ? 'online' : 'away');
    });
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    window.addEventListener('pagehide', () => this.update('offline'));
  }


  /** Sets the status to online or away depending on tab visibility. */
  private onVisibilityChange(): void {
    this.update(document.visibilityState === 'visible' ? 'online' : 'away');
  }


  /** Writes the status of the signed-in user, ignoring failures. */
  private update(status: 'online' | 'away' | 'offline'): void {
    if (this.uid) {
      this.users.setStatus(this.uid, status).catch(() => undefined);
    }
  }
}
