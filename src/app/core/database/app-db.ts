import Dexie, { Table } from 'dexie';

export interface Product {
  id?: number;
  code?: string;
  barcode?: string;
  name: string;
  stock?: number;
  price?: number;
  cost?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Inventory {
  id?: number;
  name: string;
  description?: string;
  status?: 'active' | 'completed';
  createdAt: Date;
  updatedAt?: Date;
}

export interface InventoryItem {

  id?: number;
  inventoryId: number;
  productId: number;
  quantity: number;
  productNameSnapshot?: string;
  barcodeSnapshot?: string;
  skuSnapshot?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AppDB extends Dexie {
  products!: Table<Product, number>;
  inventories!: Table<Inventory, number>;
  inventoryItems!: Table<InventoryItem, number>;

  constructor() {
    super('scanstock-db');

    this.version(1).stores({
      products: `
        ++id,
        &barcode,
        &code,
        *name
      `,

      inventories: `
        ++id,
        name,
        status,
        createdAt
      `,

      inventoryItems: `
        ++id,
        [inventoryId+productId],
        inventoryId,
        productId
      `,
    });
  }
}

export const db = new AppDB();
