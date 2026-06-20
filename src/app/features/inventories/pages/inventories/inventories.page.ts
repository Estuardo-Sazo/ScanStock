import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { albumsOutline, addOutline } from 'ionicons/icons';
import { InventoryCardComponent } from '../../components/inventory-card/inventory-card.component';
import { FloatingActionButtonComponent } from '../../../../shared/components/floating-action-button/floating-action-button.component';
import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import { InventoryFormModalComponent } from '../../modals/inventory-form-modal/inventory-form-modal.component';
import { InventoryService } from '../../../../core/services/inventory.service';
import { Inventory } from '../../../../core/database/app-db';

@Component({
  selector: 'app-inventories',
  standalone: true,
  templateUrl: './inventories.page.html',
  styleUrls: ['./inventories.page.scss'],
  imports: [
    IonContent, IonIcon, IonButton,
    CommonModule, FormsModule,
    InventoryCardComponent,
    BottomNavbarComponent,
    FloatingActionButtonComponent,
  ],
})
export class InventoriesPage implements OnInit {

  constructor() { addIcons({ albumsOutline, addOutline }); }

  private inventoryService = inject(InventoryService);

  private modalController = inject(ModalController);


  inventories: Inventory[] = [];

  isLoading = false;


  ngOnInit() {
    this.loadInventories();
  }


  loadInventories() {
    this.isLoading = true;

    this.inventoryService.getAll().subscribe({
      next: (inventories) => {
        this.inventories = inventories;

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading inventories:', error);

        this.isLoading = false;
      },
    });
  }



  async openCreateModal() {
    const modal = await this.modalController.create({
      component: InventoryFormModalComponent,

      cssClass: 'inventory-form-modal',

      showBackdrop: true,

      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.success) {
      this.loadInventories();
    }
  }



  async openEditModal(inventory: Inventory) {
    const modal = await this.modalController.create({
      component: InventoryFormModalComponent,

      componentProps: {
        inventory,
      },

      cssClass: 'inventory-form-modal',

      showBackdrop: true,

      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.success) {
      this.loadInventories();
    }
  }



  deleteInventory(id: number) {
    const confirmed = confirm('¿Eliminar inventario?');

    if (!confirmed) return;

    this.inventoryService.delete(id).subscribe({
      next: () => {
        this.loadInventories();
      },

      error: (error) => {
        console.error('Error deleting inventory:', error);
      },
    });
  }
}
