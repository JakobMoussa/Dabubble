import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelPreview } from '../../../models/view.models';

export interface ChannelChanges {
  name: string;
  description: string;
}

type EditField = 'name' | 'description' | null;

@Component({
  selector: 'app-channel-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './channel-settings.component.html',
  styleUrl: './channel-settings.component.scss'
})
export class ChannelSettingsComponent implements AfterViewInit {
  @Input({ required: true }) channel!: ChannelPreview;
  @Input() creatorName = '';
  @Input() existingNames: string[] = [];
  @Input() errorMessage = '';
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ChannelChanges>();
  @Output() left = new EventEmitter<void>();
  @ViewChild('dialog') private dialogRef!: ElementRef<HTMLDialogElement>;

  editing: EditField = null;
  draftName = '';
  draftDescription = '';


  ngAfterViewInit(): void {
    this.dialogRef.nativeElement.showModal();
  }


  get nameError(): string {
    const name = this.draftName.trim().replace(/^#+/, '');
    if (!name) {
      return '*Bitte gib einen Channel-Namen ein.';
    }
    const taken = this.existingNames.some((n) => n.toLowerCase() === name.toLowerCase() && n !== this.channel.name);
    return taken ? '*Ein Channel mit diesem Namen existiert bereits.' : '';
  }


  startEdit(field: EditField): void {
    this.draftName = this.channel.name;
    this.draftDescription = this.channel.description ?? '';
    this.editing = field;
  }


  save(): void {
    if (this.editing === 'name' && this.nameError) {
      return;
    }
    this.saved.emit({ name: this.draftName.trim().replace(/^#+/, ''), description: this.draftDescription.trim() });
    this.editing = null;
  }


  close(): void {
    this.dialogRef.nativeElement.close();
    this.closed.emit();
  }
}
