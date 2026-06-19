import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  createOutline,
  trashOutline,
} from 'ionicons/icons';

import {
  InventoryItem,
} from '../../../../core/database/app-db';

@Component({
  selector: 'app-scanned-product-card',

  standalone: true,

  imports: [
    CommonModule,
    IonIcon,
  ],

  templateUrl: './scanned-product-card.component.html',
})
export class ScannedProductCardComponent {

  // =========================================
  // Input
  // =========================================

  @Input({ required: true })
  item!: InventoryItem;

  // =========================================
  // Outputs
  // =========================================

  @Output()
  edit = new EventEmitter<InventoryItem>();

  @Output()
  delete = new EventEmitter<InventoryItem>();

  constructor() {

    addIcons({
      createOutline,
      trashOutline,
    });
  }

  // =========================================
  // Actions
  // =========================================

  onEdit() {

    this.edit.emit(this.item);
  }

  onDelete() {

    this.delete.emit(this.item);
  }
}