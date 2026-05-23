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
    loadComponent: () => import('./features/inventories/pages/inventories/inventories.page').then( m => m.InventoriesPage)
  },
];
