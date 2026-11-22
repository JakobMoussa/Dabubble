import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LEGAL_PAGES, LegalPage } from './legal-content';

/** Imprint and privacy policy, selected via the route's `page` data. */
@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss'
})
export class LegalPageComponent {
  readonly page = toSignal(
    inject(ActivatedRoute).data.pipe(map((data): LegalPage => LEGAL_PAGES[data['page'] === 'privacy' ? 'privacy' : 'imprint'])),
    { initialValue: LEGAL_PAGES.imprint }
  );
}
