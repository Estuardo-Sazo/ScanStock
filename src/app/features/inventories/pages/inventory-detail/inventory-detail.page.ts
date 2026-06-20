import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonIcon, IonButton,
  ModalController, ActionSheetController, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  scanOutline, cubeOutline, addOutline,
  checkmarkCircleOutline, documentTextOutline,
  createOutline, trashOutline, closeOutline,
  playOutline, arrowBackOutline,
} from 'ionicons/icons';
import * as XLSX from 'xlsx';

import { InventoryService } from '../../../../core/services/inventory.service';
import { Inventory, InventoryItem } from '../../../../core/database/app-db';
import { ProductService } from '../../../../core/services/product';
import { Product } from '../../../../core/database/app-db';

import { ProductFormModalComponent } from '../../modals/product-form-modal/product-form-modal.component';
import { QuantityInputModalComponent } from '../../modals/quantity-input-modal/quantity-input-modal.component';
import { ScannerModalComponent } from '../../modals/scanner-modal/scanner-modal.component';
import { InventoryFormModalComponent } from '../../modals/inventory-form-modal/inventory-form-modal.component';

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
    IonIcon, IonButton, CommonModule, IonContent,
    BottomNavbarComponent, InventoryHeaderComponent,
    InventorySearchBarComponent, InventorySummaryComponent,
    EmptyInventoryStateComponent, ScannedProductCardComponent,
  ],
})
export class InventoryDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private modalController = inject(ModalController);
  private actionSheetController = inject(ActionSheetController);
  private alertController = inject(AlertController);
  private productService = inject(ProductService);

  inventoryId = signal<number | null>(null);
  inventory = signal<Inventory | null>(null);
  items = signal<InventoryItem[]>([]);
  isLoading = signal(false);
  search = signal('');
  searchResults = signal<Product[]>([]);

  totalUnits = computed(() =>
    this.items().reduce((acc, item) => acc + (item.quantity || 0), 0),
  );

  totalItems = computed(() => this.items().length);

  filteredItems = computed(() => {
    const query = this.search().toLowerCase().trim();
    if (!query) return this.items();
    return this.items().filter(
      (item) =>
        item.productNameSnapshot?.toLowerCase().includes(query) ||
        item.skuSnapshot?.toLowerCase().includes(query) ||
        item.barcodeSnapshot?.toLowerCase().includes(query),
    );
  });

  get isCompleted() { return this.inventory()?.status === 'completed'; }

  constructor() {
    addIcons({
      scanOutline, cubeOutline, addOutline,
      checkmarkCircleOutline, documentTextOutline,
      createOutline, trashOutline, closeOutline,
      playOutline, arrowBackOutline,
    });
  }

  ngOnInit() { this.loadInventory(); }

  // ── Search ──────────────────────────────────────────────────────────────
  async onSearch(term: string) {
    this.search.set(term);
    if (!term.trim()) { this.searchResults.set([]); return; }
    try {
      const results = await this.productService.search(term);
      this.searchResults.set(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  // ── Scanner ─────────────────────────────────────────────────────────────
  async openScanner() {
    const modal = await this.modalController.create({ component: ScannerModalComponent });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.barcode) await this.handleBarcode(data.barcode);
  }

  // ── Quantity Modal ───────────────────────────────────────────────────────
  async openQuantityModal(product: Product) {
    const modal = await this.modalController.create({
      component: QuantityInputModalComponent,
      componentProps: { product },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.quantity) await this.addProductToInventory(product, data.quantity);
  }

  // ── Create Product ───────────────────────────────────────────────────────
  async openCreateProductModal(barcode: string) {
    const modal = await this.modalController.create({
      component: ProductFormModalComponent,
      componentProps: { barcode },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.product) await this.openQuantityModal(data.product);
  }

  // ── Edit quantity ────────────────────────────────────────────────────────
  async editQuantity(item: InventoryItem) {
    const product: Product = {
      id: item.productId,
      name: item.productNameSnapshot ?? '',
      barcode: item.barcodeSnapshot,
      code: item.skuSnapshot,
    };
    const modal = await this.modalController.create({
      component: QuantityInputModalComponent,
      componentProps: { product, mode: 'set', currentQuantity: item.quantity, quantity: item.quantity },
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.quantity != null) {
      await firstValueFrom(this.inventoryService.updateProductQuantity(item.id!, data.quantity));
      await this.loadInventoryItems();
    }
  }

  // ── Remove item ──────────────────────────────────────────────────────────
  async removeItem(item: InventoryItem) {
    const alert = await this.alertController.create({
      header: 'Eliminar producto',
      message: `¿Quitar "${item.productNameSnapshot}" del inventario?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar', role: 'destructive',
          handler: async () => {
            await this.inventoryService.removeInventoryItem(item.id!);
            await this.loadInventoryItems();
          },
        },
      ],
    });
    await alert.present();
  }

  // ── Inventory Options ────────────────────────────────────────────────────
  async openInventoryOptions() {
    const inv = this.inventory();
    if (!inv) return;
    const isCompleted = inv.status === 'completed';

    const sheet = await this.actionSheetController.create({
      header: inv.name,
      buttons: [
        {
          text: 'Exportar a Excel',
          icon: 'document-text-outline',
          handler: () => this.exportToExcel(),
        },
        {
          text: isCompleted ? 'Reactivar inventario' : 'Finalizar inventario',
          icon: isCompleted ? 'play-outline' : 'checkmark-circle-outline',
          handler: () => this.toggleFinalize(),
        },
        {
          text: 'Editar nombre',
          icon: 'create-outline',
          handler: () => this.editInventory(),
        },
        {
          text: 'Eliminar inventario',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.deleteInventory(),
        },
        { text: 'Cancelar', role: 'cancel', icon: 'close-outline' },
      ],
    });
    await sheet.present();
  }

  async toggleFinalize() {
    const inv = this.inventory();
    if (!inv?.id) return;
    const isCompleted = inv.status === 'completed';
    const newStatus = isCompleted ? 'active' : 'completed';

    const alert = await this.alertController.create({
      header: isCompleted ? 'Reactivar inventario' : 'Finalizar inventario',
      message: isCompleted
        ? '¿Deseas reactivar este inventario para seguir contando?'
        : `¿Marcar "${inv.name}" como completado? Podrás reactivarlo después.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: isCompleted ? 'Reactivar' : 'Finalizar',
          handler: async () => {
            await firstValueFrom(this.inventoryService.update(inv.id!, { status: newStatus }));
            await this.loadInventory();
          },
        },
      ],
    });
    await alert.present();
  }

  async editInventory() {
    const inv = this.inventory();
    if (!inv) return;
    const modal = await this.modalController.create({
      component: InventoryFormModalComponent,
      componentProps: { inventory: inv, isEditing: true },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.success) await this.loadInventory();
  }

  async deleteInventory() {
    const inv = this.inventory();
    if (!inv?.id) return;
    const alert = await this.alertController.create({
      header: 'Eliminar inventario',
      message: `¿Eliminar "${inv.name}" y todos sus productos? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await firstValueFrom(this.inventoryService.delete(inv.id!));
            this.router.navigate(['/inventories']);
          },
        },
      ],
    });
    await alert.present();
  }

  exportToExcel() {
    const inv = this.inventory();
    const items = this.items();
    if (!inv) return;

    const dateStr = new Date().toLocaleDateString('es-GT');
    const statusLabel = inv.status === 'completed' ? 'Completado' : 'Activo';

    // Build sheet data
    const rows: unknown[][] = [
      ['INVENTARIO', inv.name],
      ['Fecha de exportación', dateStr],
      ['Estado', statusLabel],
      ['Total productos', items.length],
      ['Total unidades', this.totalUnits()],
      [],
      ['#', 'Producto', 'SKU', 'Código de barras', 'Cantidad'],
      ...items.map((item, i) => [
        i + 1,
        item.productNameSnapshot ?? '',
        item.skuSnapshot ?? '',
        item.barcodeSnapshot ?? '',
        item.quantity,
      ]),
      [],
      ['', '', '', 'TOTAL UNIDADES', this.totalUnits()],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 4 },
      { wch: 32 },
      { wch: 14 },
      { wch: 20 },
      { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

    const fileName = `${inv.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr.replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  // ── Barcode handler ──────────────────────────────────────────────────────
  async handleBarcode(barcode: string) {
    try {
      const product = await this.productService.findProduct(barcode);
      if (product) { this.openQuantityModal(product); return; }
      await this.openCreateProductModal(barcode);
    } catch (error) {
      console.error('Error handling barcode:', error);
    }
  }

  async addProductToInventory(product: Product, quantity: number) {
    const inventory = this.inventory();
    if (!inventory?.id || !product.id) return;
    try {
      await this.inventoryService.addOrUpdateItem({
        inventoryId: inventory.id,
        productId: product.id,
        quantity,
        productNameSnapshot: product.name,
        barcodeSnapshot: product.barcode,
        skuSnapshot: product.code,
      });
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
      const inventory = await this.inventoryService.findById(id);
      if (inventory) this.inventory.set(inventory);
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
      const result = await firstValueFrom(this.inventoryService.getInventoryItems(inventoryId));
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
    if (!term) return;
    this.searchResults.set([]);
    await this.openCreateProductModal(term);
  }
}
