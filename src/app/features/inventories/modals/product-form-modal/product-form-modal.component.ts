import { Component, Input, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ModalController,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  closeOutline,
  barcodeOutline,
  cubeOutline,
  pricetagOutline,
} from 'ionicons/icons';

import { ProductService } from '../../../../core/services/product';

@Component({
  selector: 'app-product-form-modal',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, IonContent, IonIcon],

  templateUrl: './product-form-modal.component.html',
})
export class ProductFormModalComponent implements OnInit {
  // =========================================
  // Inject
  // =========================================

  private fb = inject(FormBuilder);

  private modalController = inject(ModalController);

  private productService = inject(ProductService);

  // =========================================
  // Inputs
  // =========================================

  @Input()
  barcode = '';

  // =========================================
  // State
  // =========================================

  isLoading = false;

  // =========================================
  // Form
  // =========================================

  form = this.fb.group({
    barcode: ['', Validators.required],

    name: ['', [Validators.required, Validators.minLength(2)]],

    sku: [''],
  });

  // =========================================
  // Lifecycle
  // =========================================

  ngOnInit() {
    this.form.patchValue({
      barcode: this.barcode,
    });
  }

  // =========================================
  // Submit
  // =========================================

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoading = true;

    try {
      const value = this.form.getRawValue();

      const product = await this.productService.create({
        barcode: value.barcode || '',
        code: value.sku || '',
        name: value.name || '',
      });

      this.modalController.dismiss({ product }, 'confirm');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // =========================================
  // Close
  // =========================================

  close() {
    this.modalController.dismiss();
  }
}
