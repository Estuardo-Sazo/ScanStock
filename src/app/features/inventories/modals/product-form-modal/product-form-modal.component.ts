import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController, IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, barcodeOutline, cubeOutline,
  pricetagOutline, alertCircleOutline, createOutline,
} from 'ionicons/icons';
import { ProductService } from '../../../../core/services/product';
import { Product } from '../../../../core/database/app-db';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon, IonButton],
  templateUrl: './product-form-modal.component.html',
})
export class ProductFormModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);
  private productService = inject(ProductService);

  @Input() barcode = '';
  /** Si se pasa, activa el modo edición */
  @Input() productToEdit: Product | null = null;

  isLoading = false;

  get isEditMode() { return !!this.productToEdit; }

  form = this.fb.group({
    barcode: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    sku: [''],
    price: [null as number | null],
    cost: [null as number | null],
  });

  constructor() {
    addIcons({ closeOutline, barcodeOutline, cubeOutline, pricetagOutline, alertCircleOutline, createOutline });
  }

  async ngOnInit() {
    if (this.productToEdit) {
      this.form.patchValue({
        barcode: this.productToEdit.barcode ?? '',
        name: this.productToEdit.name,
        sku: this.productToEdit.code ?? '',
        price: this.productToEdit.price ?? null,
        cost: this.productToEdit.cost ?? null,
      });
    } else {
      const autoSku = await this.generateSku();
      this.form.patchValue({ barcode: this.barcode, sku: autoSku });
    }
  }

  private async generateSku(): Promise<string> {
    const all = await this.productService.getAll();
    const next = all.length + 1;
    return `PROD-${String(next).padStart(3, '0')}`;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    try {
      const value = this.form.getRawValue();

      if (this.isEditMode && this.productToEdit?.id) {
        await this.productService.update(this.productToEdit.id, {
          barcode: value.barcode?.trim() || undefined,
          code: value.sku?.trim() || undefined,
          name: value.name ?? '',
          price: value.price ?? undefined,
          cost: value.cost ?? undefined,
        });
        this.modalController.dismiss({ product: this.productToEdit }, 'confirm');
      } else {
        const product = await this.productService.create({
          barcode: value.barcode || '',
          code: value.sku || '',
          name: value.name || '',
          price: value.price ?? undefined,
          cost: value.cost ?? undefined,
        });
        this.modalController.dismiss({ product }, 'confirm');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      this.isLoading = false;
    }
  }

  close() {
    this.modalController.dismiss(null, 'cancel');
  }
}
