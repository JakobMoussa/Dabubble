import { Component, EventEmitter, Input, Output } from '@angular/core';
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

    @Input() userName = '';
    @Input() userAvatar = '';
    @Input() canEdit = true;

    @Output() closed = new EventEmitter<void>();
    @Output() nameSaved = new EventEmitter<string>();

    startEditing(): void {
        this.editedName = this.userName;
        this.isEditing = true;
    }

    cancelEditing(): void {
        this.isEditing = false;
        this.editedName = this.userName;
    }

    closePopup(): void {
        this.closed.emit();
    }

    saveProfile(): void {
        const newName = this.editedName.trim();

        if (!newName) {
            return;
        }

        this.nameSaved.emit(newName);
        this.isEditing = false;
    }
}