import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisVerticalOutline } from 'ionicons/icons';
import { Inventory } from '../../../../core/database/app-db';

@Component({
  selector: 'app-inventory-header',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './inventory-header.component.html',
})
export class InventoryHeaderComponent {
  @Input({ required: true }) inventory!: Inventory;
  @Output() options = new EventEmitter<void>();

  get isCompleted() { return this.inventory.status === 'completed'; }
  get statusLabel() { return this.isCompleted ? 'Completado' : 'Activo'; }
  get statusClass() {
    return this.isCompleted
      ? 'shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700'
      : 'shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700';
  }

  constructor() { addIcons({ ellipsisVerticalOutline }); }
}
