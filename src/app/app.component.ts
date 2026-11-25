import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PresenceService } from './services/presence.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dabubble';

  /** Starts the presence tracking of the signed-in user. */
  constructor() {
    inject(PresenceService).start(inject(DestroyRef));
  }
}
