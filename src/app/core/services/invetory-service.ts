import { Injectable } from '@angular/core';
import { db, Inventory, InventoryItem } from '../database/app-db';

@Injectable({
  providedIn: 'root',
})
export class InvetoryService {
  // =========================================
  // Crear inventario
  // =========================================
  async createInventory(name: string) {
    return await db.inventories.add({
      name,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // =========================================
  // Obtener inventarios
  // =========================================
  async getInventories() {
    return await db.inventories.orderBy('createdAt').reverse().toArray();
  }

  // =========================================
  // Obtener inventario por ID
  // =========================================
  async getInventoryById(id: number) {
    return await db.inventories.get(id);
  }

  // =========================================
  // Finalizar inventario
  // =========================================
  async completeInventory(id: number) {
    return await db.inventories.update(id, {
      status: 'completed',
      updatedAt: new Date(),
    });
  }

  // =========================================
  // Agregar producto al inventario
  // (ACUMULACIÓN AUTOMÁTICA)
  // =========================================
  async addProduct(inventoryId: number, productId: number, quantity: number) {
    const existing = await db.inventoryItems
      .where('[inventoryId+productId]')
      .equals([inventoryId, productId])
      .first();

    // =====================================
    // Si ya existe → sumar
    // =====================================
    if (existing) {
      return await db.inventoryItems.update(existing.id!, {
        quantity: existing.quantity + quantity,
        updatedAt: new Date(),
      });
    }

    // =====================================
    // Si NO existe → crear
    // =====================================
    return await db.inventoryItems.add({
      inventoryId,
      productId,
      quantity,

      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // =========================================
  // Obtener items inventario
  // =========================================
  async getInventoryItems(inventoryId: number) {
    const items = await db.inventoryItems
      .where('inventoryId')
      .equals(inventoryId)
      .toArray();

    // Traer producto relacionado
    return await Promise.all(
      items.map(async (item) => {
        const product = await db.products.get(item.productId);

        return {
          ...item,
          product,
        };
      }),
    );
  }

  // =========================================
  // Actualizar cantidad manualmente
  // =========================================
  async updateQuantity(itemId: number, quantity: number) {
    return await db.inventoryItems.update(itemId, {
      quantity,
      updatedAt: new Date(),
    });
  }

  // =========================================
  // Eliminar item
  // =========================================
  async removeItem(itemId: number) {
    return await db.inventoryItems.delete(itemId);
  }
}
