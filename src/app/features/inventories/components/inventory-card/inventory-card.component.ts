import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inventory } from '../../../../core/database/app-db';
import { InventoryService } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-card',
  templateUrl: './inventory-card.component.html',
  styleUrls: ['./inventory-card.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class InventoryCardComponent implements OnInit {
  @Input() inventory?: Inventory;
  @Input() title = '';
  @Input() date = '';
  @Input() total = 0;
  @Input() status = 'active';

  @Output() onEdit = new EventEmitter<Inventory>();
  @Output() onDelete = new EventEmitter<Inventory>();

  productCount = 0;
  colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];
  colorIndex = 0;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    if (this.inventory) {
      this.loadProductCount();
      // Asignar color basado en inventoryId
      this.colorIndex = (this.inventory.id || 0) % this.colors.length;
    }
  }

  /**
   * Cargar cantidad de productos del inventario
   */
  loadProductCount() {
    if (this.inventory?.id) {
      this.inventoryService.countProducts(this.inventory.id).subscribe({
        next: (count) => {
          this.productCount = count;
        },
        error: (error) => {
          console.error('Error al contar productos:', error);
        },
      });
    }
  }

  /**
   * Emitir evento de edición
   */
  edit() {
    if (this.inventory) {
      this.onEdit.emit(this.inventory);
    }
  }

  /**
   * Emitir evento de eliminación
   */
  delete() {
    if (this.inventory) {
      this.onDelete.emit(this.inventory);
    }
  }

  /**
   * Obtener nombre a mostrar
   */
  get displayName(): string {
    return this.inventory?.name || this.title;
  }

  /**
   * Obtener fecha a mostrar
   */
  get displayDate(): string {
    if (this.inventory?.createdAt) {
      return new Date(this.inventory.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return this.date;
  }

  /**
   * Obtener total a mostrar
   */
  get displayTotal(): number {
    return this.productCount || this.total;
  }

  /**
   * Obtener color de la barra lateral
   */
  get sidebarColor(): string {
    return this.colors[this.colorIndex];
  }
}
