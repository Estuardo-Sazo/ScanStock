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
        !!product.name?.toLowerCase().includes(term.toLowerCase()),
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
          !!product.name?.toLowerCase().includes(cleanTerm) ||
          !!product.code?.toLowerCase().includes(cleanTerm) ||
          !!product.barcode?.toLowerCase().includes(cleanTerm)
        );
      })
      .limit(20)
      .toArray();
  }

  async create(product: Product): Promise<Product> {
    const now = new Date();
    const data: Product = {
      ...product,
      barcode: product.barcode?.trim() || undefined,
      code: product.code?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.products.add(data);
    return { ...data, id: id as number };
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

  findProduct(search: string): Promise<Product | null> {
    return db.products
      .where('barcode')
      .equals(search.trim())
      .first()
      .then((product) => product || null);
  }

  
}
