import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { scanOutline, cubeOutline, addOutline } from 'ionicons/icons';

import { InventoryService } from '../../../../core/services/inventory.service';

import { Inventory, InventoryItem } from '../../../../core/database/app-db';

import { ModalController } from '@ionic/angular/standalone';

import { ProductService } from '../../../../core/services/product';

import { Product } from '../../../../core/database/app-db';

import { ProductFormModalComponent } from '../../modals/product-form-modal/product-form-modal.component';
import { QuantityInputModalComponent } from '../../modals/quantity-input-modal/quantity-input-modal.component';
import { ScannerModalComponent } from '../../modals/scanner-modal/scanner-modal.component';

// =========================================
// Components
// =========================================

import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import { InventoryHeaderComponent } from '../../components/inventory-header/inventory-header.component';
import { InventorySearchBarComponent } from '../../components/inventory-search-bar/inventory-search-bar.component';
import { InventorySummaryComponent } from '../../components/inventory-summary/inventory-summary.component';
import { EmptyInventoryStateComponent } from '../../components/empty-inventory-state/empty-inventory-state.component';
import { ScannedProductCardComponent } from '../../components/scanned-product-card/scanned-product-card.component';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  templateUrl: './inventory-detail.page.html',
  styleUrls: ['./inventory-detail.page.scss'],
  imports: [
    IonIcon,
    IonButton,
    CommonModule,
    IonContent,
    BottomNavbarComponent,
    InventoryHeaderComponent,
    InventorySearchBarComponent,
    InventorySummaryComponent,
    EmptyInventoryStateComponent,
    ScannedProductCardComponent,
  ],
})
export class InventoryDetailPage implements OnInit {
  // =========================================
  // Inject
  // =========================================

  private route = inject(ActivatedRoute);
  private inventoryService = inject(InventoryService);
  private modalController = inject(ModalController);
  private productService = inject(ProductService);

  // =========================================
  // State
  // =========================================

  inventoryId = signal<number | null>(null);
  inventory = signal<Inventory | null>(null);
  items = signal<InventoryItem[]>([]);
  isLoading = signal(false);
  search = signal('');
  searchResults = signal<Product[]>([]);

  // =========================================
  // Computed
  // =========================================

  totalUnits = computed(() => {
    const list = this.items();
    if (!Array.isArray(list)) return 0;
    return list.reduce((acc, item) => acc + (item.quantity || 0), 0);
  });

  totalItems = computed(() => {
    const list = this.items();
    if (!Array.isArray(list)) return 0;
    return list.length;
  });

  filteredItems = computed(() => {
    const query = this.search().toLowerCase().trim();
    if (!query) return this.items();
    return this.items().filter((item) =>
      item.productNameSnapshot?.toLowerCase().includes(query) ||
      item.skuSnapshot?.toLowerCase().includes(query) ||
      item.barcodeSnapshot?.toLowerCase().includes(query),
    );
  });

  constructor() {
    addIcons({ scanOutline, cubeOutline, addOutline });
  }

  // =========================================
  // Lifecycle
  // =========================================

  ngOnInit() {
    this.loadInventory();
  }

  // =========================================
  // Search
  // =========================================

  async onSearch(term: string) {
    this.search.set(term);

    // =====================================
    // vacío
    // =====================================

    if (!term.trim()) {
      this.searchResults.set([]);

      return;
    }

    try {
      // =====================================
      // Buscar productos
      // =====================================

      const results = await this.productService.search(term);
    console.log('🔍 Search results:', results); // 👈 agrega esto
      this.searchResults.set(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  // =========================================
  // Scanner
  // =========================================

  async openScanner() {
    const modal = await this.modalController.create({
      component: ScannerModalComponent,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.barcode) {
      await this.handleBarcode(data.barcode);
    }
  }
  // =========================================
  // Quantity Modal
  // =========================================

  async openQuantityModal(product: Product) {
    const modal = await this.modalController.create({
      component: QuantityInputModalComponent,
      componentProps: { product },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data?.quantity) {
      await this.addProductToInventory(product, data.quantity);
    }
  }
  // =========================================
  // Create Product
  // =========================================

 async openCreateProductModal(barcode: string) {
  const modal = await this.modalController.create({
    component: ProductFormModalComponent,
    componentProps: { barcode },
    breakpoints: [0, 1],
    initialBreakpoint: 1,
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'confirm' && data?.product) {
    await this.openQuantityModal(data.product);
  }
}

  // =========================================
  // Edit quantity
  // =========================================

  async editQuantity(item: InventoryItem) {
    const product: Product = {
      id: item.productId,
      name: item.productNameSnapshot ?? '',
      barcode: item.barcodeSnapshot,
      code: item.skuSnapshot,
    };

    const modal = await this.modalController.create({
      component: QuantityInputModalComponent,
      componentProps: {
        product,
        mode: 'set',
        currentQuantity: item.quantity,
        quantity: item.quantity,
      },
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data?.quantity != null) {
      await firstValueFrom(
        this.inventoryService.updateProductQuantity(item.id!, data.quantity),
      );
      await this.loadInventoryItems();
    }
  }

  // =========================================
  // Remove item
  // =========================================

  async removeItem(item: InventoryItem) {
    const confirmed = confirm(`Eliminar ${item.productNameSnapshot}?`);

    if (!confirmed) {
      return;
    }

    try {
      await this.inventoryService.removeInventoryItem(item.id!);

      await this.loadInventory();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  async handleBarcode(barcode: string) {
    try {
      // =====================================
      // Buscar producto
      // =====================================

      const product = await this.productService.findProduct(barcode);

      // =====================================
      // Producto existe
      // =====================================

      if (product) {
        this.openQuantityModal(product);

        return;
      }

      // =====================================
      // Producto NO existe
      // =====================================

      await this.openCreateProductModal(barcode);
    } catch (error) {
      console.error('Error handling barcode:', error);
    }
  }

  async addProductToInventory(product: Product, quantity: number) {
    const inventory = this.inventory();

    if (!inventory?.id || !product.id) {
      return;
    }

    try {
      // =====================================
      // Agregar / sumar
      // =====================================

      await this.inventoryService.addOrUpdateItem({
        inventoryId: inventory.id,
        productId: product.id,
        quantity,
        productNameSnapshot: product.name,
        barcodeSnapshot: product.barcode,
        skuSnapshot: product.code,
      });

      // =====================================
      // Reload
      // =====================================

      this.loadInventoryItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  async loadInventory() {
    this.isLoading.set(true);

    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));

      this.inventoryId.set(id);

      // =====================================
      // Inventory
      // =====================================

      const inventory = await this.inventoryService.findById(id);

      if (inventory) {
        this.inventory.set(inventory);
      }

      // =====================================
      // Load items
      // =====================================

      await this.loadInventoryItems();
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadInventoryItems() {
    const inventoryId = this.inventoryId();
    if (!inventoryId) return;

    try {
      const result = await firstValueFrom(
        this.inventoryService.getInventoryItems(inventoryId),
      );

      // Garantiza que siempre sea array
      this.items.set(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading items:', error);
      this.items.set([]);
    }
  }

  async selectProduct(product: Product) {
    this.searchResults.set([]);

    this.search.set('');

    await this.openQuantityModal(product);
  }

  async createFromSearch() {
    const term = this.search();

    if (!term) {
      return;
    }

    this.searchResults.set([]);

    await this.openCreateProductModal(term);
  }
}
