import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { routeFirebaseActionLink } from './app/shared/action-link';

const BOOT_ERROR = 'DABubble konnte nicht geladen werden. Bitte in ein paar Minuten erneut versuchen.';

routeFirebaseActionLink();

bootstrapApplication(AppComponent, appConfig)
  .catch(() => { document.body.textContent = BOOT_ERROR; });
