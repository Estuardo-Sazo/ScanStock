import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inventory } from '../../../../core/database/app-db';

@Component({
  selector: 'app-inventory-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-header.component.html',
})
export class InventoryHeaderComponent {
  @Input({ required: true }) inventory!: Inventory;

  get isCompleted() { return this.inventory.status === 'completed'; }
  get statusLabel() { return this.isCompleted ? 'Completado' : 'Activo'; }
  get statusClass() {
    return this.isCompleted
      ? 'shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700'
      : 'shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700';
  }
}
