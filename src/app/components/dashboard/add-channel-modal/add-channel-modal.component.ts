import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ModalMemberOption {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  isCurrentUser?: boolean;
}

export interface CreatedChannelPayload {
  name: string;
  description: string;
  memberIds: string[];
}

@Component({
  selector: 'app-add-channel-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-channel-modal.component.html',
  styleUrl: './add-channel-modal.component.scss'
})
export class AddChannelModalComponent implements AfterViewInit {
  @Input() existingChannelNames: string[] = [];
  @Input() members: ModalMemberOption[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() channelCreated = new EventEmitter<CreatedChannelPayload>();
  @ViewChild('channelDialog') dialogRef!: ElementRef<HTMLDialogElement>;

  step: 'details' | 'members' = 'details';
  channelName = '';
  channelDescription = '';
  nameTouched = false;

  inviteMode: 'all' | 'specific' = 'all';
  memberSearch = '';
  selectedMembers: ModalMemberOption[] = [];

  /** Opens the dialog as a modal once the view is initialized. */
  ngAfterViewInit(): void {
    const dialog = this.dialogRef.nativeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
  }

  /** Returns the channel name trimmed and without leading # characters. */
  getNormalizedName(): string {
    return this.channelName.trim().replace(/^#+/, '').trim();
  }

  /** Checks whether a channel with the normalized name already exists, ignoring case. */
  isDuplicateName(): boolean {
    const normalized = this.getNormalizedName().toLowerCase();
    if (!normalized) {
      return false;
    }
    return this.existingChannelNames.some((n) => n.toLowerCase() === normalized);
  }

  /** Checks that the normalized name is not empty and not a duplicate. */
  isNameValid(): boolean {
    const normalized = this.getNormalizedName();
    return normalized.length > 0 && !this.isDuplicateName();
  }

  /** Returns the validation message for the channel name, or an empty string if there is none. */
  getNameError(): string {
    if (!this.nameTouched) {
      return '';
    }
    if (!this.getNormalizedName()) {
      return '*Bitte gib einen Channel-Namen ein.';
    }
    return this.isDuplicateName() ? '*Dieser Channel existiert bereits.' : '';
  }

  /** Marks the name field as touched. */
  onNameBlur(): void {
    this.nameTouched = true;
  }

  /** Moves to the members step if the channel name is valid. */
  onProceedToMembers(): void {
    this.nameTouched = true;
    if (!this.isNameValid()) {
      return;
    }
    this.step = 'members';
  }

  /** Returns the selectable members matching the search, with guests sorted last and the rest alphabetically. */
  getFilteredMembers(): ModalMemberOption[] {
    const query = this.memberSearch.trim().toLowerCase();
    const isGuest = (m: ModalMemberOption) => Number(m.name.startsWith('Gast'));
    return this.members
      .filter((m) => this.isAvailableMember(m, query))
      .sort((a, b) => isGuest(a) - isGuest(b) || a.name.localeCompare(b.name));
  }

  /** Checks that a member is not the current user, not already selected and matches the search query. */
  private isAvailableMember(member: ModalMemberOption, query: string): boolean {
    if (member.isCurrentUser || this.isMemberSelected(member.id)) {
      return false;
    }
    return !query || member.name.toLowerCase().includes(query);
  }

  /** Checks whether a member is already in the selected list. */
  private isMemberSelected(memberId: string): boolean {
    return this.selectedMembers.some((m) => m.id === memberId);
  }

  /** Adds a member to the selection and clears the search field. */
  addMember(member: ModalMemberOption): void {
    if (!this.isMemberSelected(member.id)) {
      this.selectedMembers = [...this.selectedMembers, member];
      this.memberSearch = '';
    }
  }

  /** Removes a member from the selection by id. */
  removeMember(memberId: string): void {
    this.selectedMembers = this.selectedMembers.filter((m) => m.id !== memberId);
  }

  /** Checks that the channel can be created, either for all members or with at least one selected member. */
  canCreateChannel(): boolean {
    return this.inviteMode === 'all' || this.selectedMembers.length > 0;
  }

  /** Emits the new channel data and closes the dialog. */
  onCreateChannel(): void {
    if (!this.canCreateChannel()) {
      return;
    }
    this.channelCreated.emit({
      name: this.getNormalizedName(),
      description: this.channelDescription.trim(),
      memberIds: this.resolveMemberIds()
    });
    this.requestClose();
  }

  /** Returns the ids of the members to add, including the current user when inviting specific members. */
  private resolveMemberIds(): string[] {
    if (this.inviteMode === 'all') {
      return this.members.map((m) => m.id);
    }
    const ownId = this.members.find((m) => m.isCurrentUser)?.id;
    const ids = this.selectedMembers.map((m) => m.id);
    return ownId && !ids.includes(ownId) ? [ownId, ...ids] : ids;
  }

  /** Closes the dialog. */
  requestClose(): void {
    this.dialogRef.nativeElement.close();
  }

  /** Emits the closed event when the dialog was closed. */
  onNativeClose(): void {
    this.closed.emit();
  }

  /** Closes the dialog when the click lands on the backdrop outside the dialog box. */
  onDialogBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogRef.nativeElement;
    if ('closedBy' in HTMLDialogElement.prototype || event.target !== dialog) {
      return;
    }
    if (!this.isInsideDialogRect(event, dialog.getBoundingClientRect())) {
      dialog.close();
    }
  }

  /** Checks whether the click position lies within the given dialog rectangle. */
  private isInsideDialogRect(event: MouseEvent, rect: DOMRect): boolean {
    const inY = rect.top <= event.clientY && event.clientY <= rect.top + rect.height;
    const inX = rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
    return inX && inY;
  }
}
