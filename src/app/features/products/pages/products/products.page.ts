import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonButton, ModalController, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cubeOutline, searchOutline, closeOutline, addOutline,
  createOutline, trashOutline, barcodeOutline, pricetagOutline,
} from 'ionicons/icons';

import { ProductService } from '../../../../core/services/product';
import { Product } from '../../../../core/database/app-db';
import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import { FloatingActionButtonComponent } from '../../../../shared/components/floating-action-button/floating-action-button.component';
import { ProductFormModalComponent } from '../../../inventories/modals/product-form-modal/product-form-modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.page.html',
  imports: [
    IonContent, IonIcon, IonButton,
    CommonModule, FormsModule,
    BottomNavbarComponent,
    FloatingActionButtonComponent,
  ],
})
export class ProductsPage implements OnInit {
  private productService = inject(ProductService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

  constructor() {
    addIcons({
      cubeOutline, searchOutline, closeOutline, addOutline,
      createOutline, trashOutline, barcodeOutline, pricetagOutline,
    });
  }

  products = signal<Product[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  activeFilter = signal<'all' | 'barcode' | 'nosku'>('all');

  filteredProducts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const filter = this.activeFilter();
    let list = this.products();

    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
      );
    }

    if (filter === 'barcode') list = list.filter(p => !!p.barcode);
    if (filter === 'nosku') list = list.filter(p => !p.code);

    return list;
  });

  get totalProducts() { return this.products().length; }
  get totalWithBarcode() { return this.products().filter(p => !!p.barcode).length; }

  ngOnInit() { this.loadProducts(); }

  async loadProducts() {
    this.isLoading.set(true);
    try {
      const list = await this.productService.getAll();
      this.products.set(list);
    } finally {
      this.isLoading.set(false);
    }
  }

  setFilter(f: 'all' | 'barcode' | 'nosku') {
    this.activeFilter.set(f);
  }

  clearSearch() { this.searchQuery.set(''); }

  async openCreateModal() {
    const modal = await this.modalController.create({
      component: ProductFormModalComponent,
      componentProps: { barcode: '' },
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') await this.loadProducts();
  }

  async openEditModal(product: Product, event: Event) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: ProductFormModalComponent,
      componentProps: {
        barcode: product.barcode ?? '',
        productToEdit: product,
      },
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'confirm') await this.loadProducts();
  }

  async confirmDelete(product: Product, event: Event) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: 'Eliminar producto',
      message: `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.productService.delete(product.id!);
            await this.loadProducts();
          },
        },
      ],
    });
    await alert.present();
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getAvatarColor(id?: number): string {
    const colors = ['bg-blue-100', 'bg-emerald-100', 'bg-violet-100', 'bg-amber-100', 'bg-rose-100'];
    return colors[(id ?? 0) % colors.length];
  }

  getAvatarText(id?: number): string {
    const colors = ['text-blue-700', 'text-emerald-700', 'text-violet-700', 'text-amber-700', 'text-rose-700'];
    return colors[(id ?? 0) % colors.length];
  }
}
