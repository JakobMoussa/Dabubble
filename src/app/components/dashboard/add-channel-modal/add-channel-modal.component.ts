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


  ngAfterViewInit(): void {
    const dialog = this.dialogRef.nativeElement;
    if (!dialog.open) {
      dialog.showModal();
    }
  }


  getNormalizedName(): string {
    return this.channelName.trim().replace(/^#+/, '').trim();
  }


  isDuplicateName(): boolean {
    const normalized = this.getNormalizedName().toLowerCase();
    if (!normalized) {
      return false;
    }
    return this.existingChannelNames.some((n) => n.toLowerCase() === normalized);
  }


  isNameValid(): boolean {
    const normalized = this.getNormalizedName();
    return normalized.length > 0 && !this.isDuplicateName();
  }


  getNameError(): string {
    if (!this.nameTouched) {
      return '';
    }
    if (!this.getNormalizedName()) {
      return '*Bitte gib einen Channel-Namen ein.';
    }
    return this.isDuplicateName() ? '*Dieser Channel existiert bereits.' : '';
  }


  onNameBlur(): void {
    this.nameTouched = true;
  }


  onProceedToMembers(): void {
    this.nameTouched = true;
    if (!this.isNameValid()) {
      return;
    }
    this.step = 'members';
  }


  getFilteredMembers(): ModalMemberOption[] {
    const query = this.memberSearch.trim().toLowerCase();
    return this.members.filter((m) => this.isAvailableMember(m, query));
  }


  private isAvailableMember(member: ModalMemberOption, query: string): boolean {
    if (member.isCurrentUser || this.isMemberSelected(member.id)) {
      return false;
    }
    return !query || member.name.toLowerCase().includes(query);
  }


  private isMemberSelected(memberId: string): boolean {
    return this.selectedMembers.some((m) => m.id === memberId);
  }


  addMember(member: ModalMemberOption): void {
    if (!this.isMemberSelected(member.id)) {
      this.selectedMembers = [...this.selectedMembers, member];
      this.memberSearch = '';
    }
  }


  removeMember(memberId: string): void {
    this.selectedMembers = this.selectedMembers.filter((m) => m.id !== memberId);
  }


  canCreateChannel(): boolean {
    return this.inviteMode === 'all' || this.selectedMembers.length > 0;
  }


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


  private resolveMemberIds(): string[] {
    if (this.inviteMode === 'all') {
      return this.members.map((m) => m.id);
    }
    const ownId = this.members.find((m) => m.isCurrentUser)?.id;
    const ids = this.selectedMembers.map((m) => m.id);
    return ownId && !ids.includes(ownId) ? [ownId, ...ids] : ids;
  }


  requestClose(): void {
    this.dialogRef.nativeElement.close();
  }


  onNativeClose(): void {
    this.closed.emit();
  }


  onDialogBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogRef.nativeElement;
    if ('closedBy' in HTMLDialogElement.prototype || event.target !== dialog) {
      return;
    }
    if (!this.isInsideDialogRect(event, dialog.getBoundingClientRect())) {
      dialog.close();
    }
  }


  private isInsideDialogRect(event: MouseEvent, rect: DOMRect): boolean {
    const inY = rect.top <= event.clientY && event.clientY <= rect.top + rect.height;
    const inX = rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
    return inX && inY;
  }
}
