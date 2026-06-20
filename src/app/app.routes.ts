import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'inventories',
    pathMatch: 'full',
  },

  {
    path: 'inventories',
    loadComponent: () =>
      import('./features/inventories/pages/inventories/inventories.page').then(
        (m) => m.InventoriesPage,
      ),
  },
  {
    path: 'inventories/:id',
    loadComponent: () =>
      import('./features/inventories/pages/inventory-detail/inventory-detail.page').then(
        (m) => m.InventoryDetailPage,
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/pages/products/products.page').then(
        (m) => m.ProductsPage,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/pages/settings/settings.page').then(
        (m) => m.SettingsPage,
      ),
  },
  {
    path: 'scan',
    redirectTo: 'inventories',
    pathMatch: 'full',
  },
];
