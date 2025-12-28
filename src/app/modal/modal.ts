import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  @Input() open = false;
  @Input() imageUrl!: string;

  @Output() close = new EventEmitter<void>();

  onBackdropClick() {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open) {
      this.close.emit();
    }
  }
}
