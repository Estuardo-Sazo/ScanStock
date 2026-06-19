import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { Product } from '../../../../core/database/app-db';

@Component({
  selector: 'app-quantity-input-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
  templateUrl: './quantity-input-modal.component.html',
})
export class QuantityInputModalComponent {
  private modalController = inject(ModalController);

  @Input() product!: Product;

  /** 'add' suma al existente, 'set' reemplaza */
  @Input() mode: 'add' | 'set' = 'add';

  /** Cantidad actual del item (modo set) */
  @Input() currentQuantity = 0;

  @Input() quantity = 1;

  constructor() {
    addIcons({ closeOutline });
  }

  get productName(): string {
    return this.product?.name ?? '';
  }

  get barcode(): string {
    return this.product?.barcode ?? this.product?.code ?? '';
  }

  get confirmLabel(): string {
    return this.mode === 'set' ? 'Guardar cantidad' : 'Agregar al inventario';
  }

  increase(value: number) {
    this.quantity += value;
  }

  confirm() {
    this.modalController.dismiss({ quantity: this.quantity }, 'confirm');
  }

  close() {
    this.modalController.dismiss(null, 'cancel');
  }
}
