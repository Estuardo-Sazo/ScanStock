import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import {
  Inventory,
} from '../../../../core/database/app-db';

import { InventoryService } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-card',

  standalone: true,

  imports: [
    CommonModule,
  ],

  templateUrl: './inventory-card.component.html',

  styleUrls: ['./inventory-card.component.scss'],
})
export class InventoryCardComponent implements OnInit {

  // =========================================
  // Inject
  // =========================================

  private router = inject(Router);

  private inventoryService = inject(
    InventoryService
  );

  // =========================================
  // Inputs
  // =========================================

  @Input({ required: true })
  inventory!: Inventory;

  @Input()
  status: 'active' | 'synced' = 'active';

  // =========================================
  // Outputs
  // =========================================

  @Output()
  onEdit = new EventEmitter<Inventory>();

  @Output()
  onDelete = new EventEmitter<Inventory>();

  // =========================================
  // State
  // =========================================

  productCount = 0;

  private colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-purple-500',
  ];

  colorIndex = 0;

  // =========================================
  // Lifecycle
  // =========================================

  ngOnInit() {

    this.loadProductCount();

    this.colorIndex =
      (this.inventory.id || 0)
      % this.colors.length;
  }

  // =========================================
  // Load product count
  // =========================================

  loadProductCount() {

    if (!this.inventory.id) {

      return;
    }

    this.inventoryService
      .countProducts(this.inventory.id)
      .subscribe({

        next: (count) => {

          this.productCount = count;
        },

        error: (error) => {

          console.error(
            'Error counting products:',
            error
          );
        },
      });
  }

  // =========================================
  // Navigation
  // =========================================

  goToInventory() {

    if (!this.inventory.id) {

      return;
    }

    this.router.navigate([
      '/inventories',
      this.inventory.id,
    ]);
  }

  // =========================================
  // Edit
  // =========================================

  onEditClick(event: Event) {

    event.stopPropagation();

    this.onEdit.emit(this.inventory);
  }

  // =========================================
  // Delete
  // =========================================

  onDeleteClick(event: Event) {

    event.stopPropagation();

    this.onDelete.emit(this.inventory);
  }

  // =========================================
  // Computed
  // =========================================

  get displayName(): string {

    return this.inventory.name;
  }

  get displayDate(): string {

    if (!this.inventory.createdAt) {

      return '';
    }

    return new Date(
      this.inventory.createdAt
    ).toLocaleDateString('es-ES', {

      year: 'numeric',

      month: 'short',

      day: 'numeric',
    });
  }

  get displayTotal(): number {

    return this.productCount;
  }

  get sidebarColor(): string {

    return this.colors[this.colorIndex];
  }
}