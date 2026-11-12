import { Component, EventEmitter, input, Input, Output } from '@angular/core';

@Component({
    selector: 'app-profile-popup',
    standalone: true,
    imports: [],
    templateUrl: './profile-popup.component.html',
    styleUrl: './profile-popup.component.scss'
})
export class ProfilePopupComponent {

    @Input() userName = '';
    @Input() userAvatar = '';

    @Output() closed = new EventEmitter<void>();

    closePopup(): void {
        this.closed.emit();

    }
}