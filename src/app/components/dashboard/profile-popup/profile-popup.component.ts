import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile-popup',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './profile-popup.component.html',
    styleUrl: './profile-popup.component.scss'
})
export class ProfilePopupComponent {

    isEditing = false;
    editedName = '';

    startEditing(): void {
        this.editedName = this.userName;
        this.isEditing = true;
    }

    cancelEditing(): void {
        this.isEditing = false;
        this.editedName = this.userName;
    }

    @Input() userName = '';
    @Input() userAvatar = '';

    @Output() closed = new EventEmitter<void>();

    closePopup(): void {
        this.closed.emit();
    }

    @Output() nameSaved = new EventEmitter<string>();

    saveProfile(): void {
        const newName = this.editedName.trim();

        if (!newName) {
            return;
        }

        this.nameSaved.emit(newName);
        this.isEditing = false;
    }
}