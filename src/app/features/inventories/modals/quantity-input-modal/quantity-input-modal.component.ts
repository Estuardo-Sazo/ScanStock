import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, backspaceOutline, checkmarkOutline } from 'ionicons/icons';
import { Product } from '../../../../core/database/app-db';

@Component({
  selector: 'app-quantity-input-modal',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton],
  templateUrl: './quantity-input-modal.component.html',
})
export class QuantityInputModalComponent {
  private modalController = inject(ModalController);

  @Input() product!: Product;
  @Input() mode: 'add' | 'set' = 'add';
  @Input() currentQuantity = 0;
  @Input() quantity = 0;

  /** Valor en pantalla como string para el pad numérico */
  display = '';

  constructor() {
    addIcons({ closeOutline, backspaceOutline, checkmarkOutline });
  }

  ngOnInit() {
    this.display = this.quantity > 0 ? String(this.quantity) : '';
  }

  get productName(): string {
    return this.product?.name ?? '';
  }

  get barcode(): string {
    return this.product?.barcode ?? this.product?.code ?? '';
  }

  get displayValue(): string {
    return this.display || '0';
  }

  get numericValue(): number {
    return parseInt(this.display || '0', 10);
  }

  get confirmLabel(): string {
    return this.mode === 'set' ? 'Guardar cantidad' : 'Agregar al inventario';
  }

  pressKey(key: string) {
    if (this.display.length >= 6) return;
    if (key === '0' && this.display === '') return;
    this.display += key;
  }

  backspace() {
    this.display = this.display.slice(0, -1);
  }

  quickAdd(value: number) {
    const current = this.numericValue;
    const next = current + value;
    this.display = String(Math.min(next, 999999));
  }

  confirm() {
    const qty = this.numericValue;
    if (qty <= 0) return;
    this.modalController.dismiss({ quantity: qty }, 'confirm');
  }

  close() {
    this.modalController.dismiss(null, 'cancel');
  }
}
