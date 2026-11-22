import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberPreview } from '../../../models/view.models';

@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss'
})
export class ChannelMembersComponent implements AfterViewInit {
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


  ngAfterViewInit(): void {
    this.mode = this.startInAddMode ? 'add' : 'list';
    this.dialogRef.nativeElement.showModal();
  }


  get suggestions(): MemberPreview[] {
    const term = this.search.trim().toLowerCase();
    const taken = new Set([...this.members, ...this.selected].map((m) => m.id));
    return term ? this.candidates.filter((c) => !taken.has(c.id) && c.name.toLowerCase().includes(term)) : [];
  }


  pick(member: MemberPreview): void {
    this.selected = [...this.selected, member];
    this.search = '';
  }


  unpick(memberId: string): void {
    this.selected = this.selected.filter((m) => m.id !== memberId);
  }


  confirm(): void {
    if (this.selected.length) {
      this.added.emit(this.selected.map((m) => m.id));
      this.close();
    }
  }


  close(): void {
    this.dialogRef.nativeElement.close();
    this.closed.emit();
  }
}
