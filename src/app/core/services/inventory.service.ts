import { Injectable } from '@angular/core';
import { db, Inventory, InventoryItem, Product } from '../database/app-db';
import { Observable, from, BehaviorSubject ,of} from 'rxjs';
import { map, tap ,switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private inventoriesSubject = new BehaviorSubject<Inventory[]>([]);
  public inventories$ = this.inventoriesSubject.asObservable();

  constructor() {
    this.loadInventories();
  }

  /**
   * Cargar todos los inventarios
   */
  loadInventories(): Observable<Inventory[]> {
    return from(db.inventories.toArray()).pipe(
      tap((inventories) => {
        this.inventoriesSubject.next(inventories);
      }),
    );
  }

  /**
   * Obtener todos los inventarios
   */
  getAll(): Observable<Inventory[]> {
    return from(db.inventories.toArray());
  }

  /**
   * Obtener inventario por ID
   */
  getById(id: number): Observable<Inventory | undefined> {
    return from(db.inventories.get(id));
  }

  /**
   * Crear nuevo inventario
   */
  create(inventory: Inventory): Observable<number> {
    const now = new Date();
    const newInventory: Inventory = {
      ...inventory,
      createdAt: now,
      updatedAt: now,
      status: 'active',
    };

    return from(db.inventories.add(newInventory)).pipe(
      tap(() => this.loadInventories().subscribe()),
    );
  }

  /**
   * Actualizar inventario
   */
  update(id: number, inventory: Partial<Inventory>): Observable<number> {
    const updated = {
      ...inventory,
      updatedAt: new Date(),
    };

    return from(db.inventories.update(id, updated)).pipe(
      tap(() => this.loadInventories().subscribe()),
    );
  }

  /**
   * Eliminar inventario
   */
  delete(id: number): Observable<void> {
    return from(db.inventories.delete(id)).pipe(
      tap(() => {
        db.inventoryItems.where('inventoryId').equals(id).delete();
        this.loadInventories().subscribe();
      }),
    );
  }

  removeInventoryItem(inventoryItemId: number): Observable<void> {
    return from(db.inventoryItems.delete(inventoryItemId));
  }

  /**
   * Obtener items de un inventario con detalles de productos
   */
  getInventoryItems(
    inventoryId: number,
  ): Observable<(InventoryItem & { product?: Product })[]> {
    return from(
      db.inventoryItems.where('inventoryId').equals(inventoryId).toArray(),
    ).pipe(
      switchMap((items) =>
        items.length === 0
          ? of([])
          : from(
              Promise.all(
                items.map(async (item) => ({
                  ...item,
                  product: await db.products.get(item.productId),
                })),
              ),
            ),
      ),
    );
  }

  /**
   * Contar productos en un inventario
   */
  countProducts(inventoryId: number): Observable<number> {
    return from(
      db.inventoryItems.where('inventoryId').equals(inventoryId).count(),
    );
  }

  /**
   * Agregar producto a inventario
   */
  addProductToInventory(
    inventoryId: number,
    productId: number,
    quantity: number,
  ): Observable<number> {
    const item: InventoryItem = {
      inventoryId,
      productId,
      quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return from(db.inventoryItems.add(item));
  }

  /**
   * Actualizar cantidad de producto en inventario
   */
  updateProductQuantity(
    inventoryItemId: number,
    quantity: number,
  ): Observable<number> {
    return from(
      db.inventoryItems.update(inventoryItemId, {
        quantity,
        updatedAt: new Date(),
      }),
    );
  }

  /**
   * Remover producto de inventario
   */
  removeProductFromInventory(inventoryItemId: number): Observable<void> {
    return from(db.inventoryItems.delete(inventoryItemId));
  }

  findById(id: number): Promise<Inventory | undefined> {
    return db.inventories.get(id);
  }

  async addOrUpdateItem(data: {
    inventoryId: number;
    productId: number;
    quantity: number;
    productNameSnapshot?: string;
    barcodeSnapshot?: string;
    skuSnapshot?: string;
  }) {
    try {
      // =====================================
      // Buscar si ya existe
      // =====================================

      const existingItem = await db.inventoryItems
        .where('[inventoryId+productId]')
        .equals([data.inventoryId, data.productId])
        .first();

      // =====================================
      // EXISTE
      // SUMAR
      // =====================================

      if (existingItem) {
        const newQuantity = existingItem.quantity + data.quantity;

        await db.inventoryItems.update(
          existingItem.id!,

          {
            quantity: newQuantity,
          },
        );

        return;
      }

      // =====================================
      // NO EXISTE
      // CREAR
      // =====================================

      await db.inventoryItems.add({
        inventoryId: data.inventoryId,
        productId: data.productId,
        quantity: data.quantity,
        productNameSnapshot: data.productNameSnapshot,
        barcodeSnapshot: data.barcodeSnapshot,
        skuSnapshot: data.skuSnapshot,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error addOrUpdateItem:', error);

      throw error;
    }
  }
}
