import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AVATAR_OPTIONS } from '../../../shared/avatars';

export interface ProfileChanges {
  name: string;
  avatar: string;
}

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
  editedAvatar = '';
  readonly avatars = AVATAR_OPTIONS;

  @Input() userName = '';
  @Input() userAvatar = '';
  @Input() userEmail = '';
  @Input() userOnline = true;
  @Input() canEdit = true;

  @Output() closed = new EventEmitter<void>();
  @Output() profileSaved = new EventEmitter<ProfileChanges>();

  /** Switches to edit mode with the current name and avatar and focuses the name field. */
  startEditing(): void {
    this.editedName = this.userName;
    this.editedAvatar = this.userAvatar;
    this.isEditing = true;
    setTimeout(() => document.getElementById('profile-name')?.focus(), 0);
  }

  /** Leaves edit mode and resets the edited name. */
  cancelEditing(): void {
    this.isEditing = false;
    this.editedName = this.userName;
  }

  /** Emits that the popup should be closed. */
  closePopup(): void {
    this.closed.emit();
  }

  /** Emits the edited profile if the name is not empty and leaves edit mode. */
  saveProfile(): void {
    const newName = this.editedName.trim();

    if (!newName) {
      return;
    }

    this.profileSaved.emit({ name: newName, avatar: this.editedAvatar });
    this.isEditing = false;
  }
}