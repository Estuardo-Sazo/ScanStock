import { Injectable } from '@angular/core';
import { db, Product } from '../database/app-db';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  async findByBarcode(barcode: string) {
    if (!barcode?.trim()) return null;

    return await db.products.where('barcode').equals(barcode.trim()).first();
  }

  async findByCode(code: string) {
    if (!code?.trim()) return null;

    return await db.products
      .where('code')
      .equalsIgnoreCase(code.trim())
      .first();
  }

  async searchByName(term: string) {
    if (!term?.trim()) return [];

    return await db.products
      .filter((product) =>
        product.name?.toLowerCase().includes(term.toLowerCase()),
      )
      .limit(20)
      .toArray();
  }

  async search(term: string): Promise<Product[]> {
    if (!term?.trim()) return [];

    const cleanTerm = term.trim().toLowerCase();

    return await db.products
      .filter((product) => {
        return (
          product.name?.toLowerCase().includes(cleanTerm) ||
          product.code?.toLowerCase().includes(cleanTerm) ||
          product.barcode?.toLowerCase().includes(cleanTerm)
        );
      })
      .limit(20)
      .toArray();
  }

  async create(product: Product) {
    return await db.products.add({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  async update(id: number, data: Partial<Product>) {
    return await db.products.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  async getAll() {
    return await db.products.orderBy('name').toArray();
  }

  async delete(id: number) {
    return await db.products.delete(id);
  }
}
