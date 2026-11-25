import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberPreview } from '../../../models/view.models';

/** Sorts members alphabetically with guest accounts last. */
function guestsLast(members: MemberPreview[]): MemberPreview[] {
  const isGuest = (member: MemberPreview) => Number(member.name.startsWith('Gast'));
  return [...members].sort((a, b) => isGuest(a) - isGuest(b) || a.name.localeCompare(b.name));
}

@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss'
})
export class ChannelMembersComponent implements OnInit, AfterViewInit {
  @Input() channelName = '';
  @Input() members: MemberPreview[] = [];
  @Input() candidates: MemberPreview[] = [];
  @Input() startInAddMode = false;
  @Output() closed = new EventEmitter<void>();
  @Output() added = new EventEmitter<string[]>();
  @Output() memberClicked = new EventEmitter<MemberPreview>();
  @ViewChild('dialog') private dialogRef!: ElementRef<HTMLDialogElement>;

  mode: 'list' | 'add' = 'list';
  search = '';
  selected: MemberPreview[] = [];


  /** Sets the initial mode from the start-in-add-mode input. */
  ngOnInit(): void {
    this.mode = this.startInAddMode ? 'add' : 'list';
  }


  /** Opens the dialog as a modal. */
  ngAfterViewInit(): void {
    this.dialogRef.nativeElement.showModal();
  }


  /** Channel members sorted with guests last. */
  get sortedMembers(): MemberPreview[] {
    return guestsLast(this.members);
  }


  /** Candidates matching the search term that are not yet members or selected. */
  get suggestions(): MemberPreview[] {
    const term = this.search.trim().toLowerCase();
    const taken = new Set([...this.members, ...this.selected].map((m) => m.id));
    const matches = term ? this.candidates.filter((c) => !taken.has(c.id) && c.name.toLowerCase().includes(term)) : [];
    return guestsLast(matches);
  }


  /** Adds the member to the selection and resets the search. */
  pick(member: MemberPreview): void {
    this.selected = [...this.selected, member];
    this.search = '';
  }


  /** Removes the member with the given id from the selection. */
  unpick(memberId: string): void {
    this.selected = this.selected.filter((m) => m.id !== memberId);
  }


  /** Emits the selected member ids and closes the dialog if any are selected. */
  confirm(): void {
    if (this.selected.length) {
      this.added.emit(this.selected.map((m) => m.id));
      this.close();
    }
  }


  /** Closes the dialog and emits the closed event. */
  close(): void {
    this.dialogRef.nativeElement.close();
    this.closed.emit();
  }
}
