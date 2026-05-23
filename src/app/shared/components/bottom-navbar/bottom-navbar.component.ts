import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  albumsOutline,
  albums,
  cubeOutline,
  cube,
  settingsOutline,
  settings,
  scanOutline,
  timeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-bottom-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon],
  templateUrl: './bottom-navbar.component.html',
})
export class BottomNavbarComponent {
  private router = inject(Router);

  // =========================================
  // Main tabs
  // =========================================

  private mainTabs = [
    {
      label: 'Invetarios',
      icon: albumsOutline,
      activeIcon: albums,
      route: '/inventories',
    },
    {
      label: 'Productos',
      icon: cubeOutline,
      activeIcon: cube,
      route: '/products',
    },
    {
      label: 'Ajustes',
      icon: settingsOutline,
      activeIcon: settings,
      route: '/settings',
    },
  ];

  // =========================================
  // Inventory tabs
  // =========================================

  private inventoryTabs = [
    {
      label: 'History',
      icon: timeOutline,
      activeIcon: timeOutline,
      route: '/inventories',
    },

    {
      label: 'Scan',
      icon: scanOutline,
      activeIcon: scanOutline,
      route: '/scan',
    },

    {
      label: 'Settings',
      icon: settingsOutline,
      activeIcon: settings,
      route: '/settings',
    },
  ];

  // =========================================
  // Dynamic tabs
  // =========================================

  tabs = computed(() => {
    if (this.isInventoryDetail()) {
      return this.inventoryTabs;
    }

    return this.mainTabs;
  });

  constructor() {
    addIcons({
      albumsOutline,
      albums,
      cubeOutline,
      cube,
      settingsOutline,
      settings,
      scanOutline,
      timeOutline,
    });
  }

  // =========================================
  // Detect inventory detail
  // =========================================

  isInventoryDetail(): boolean {
    return this.router.url.startsWith('/inventories/');
  }

  // =========================================
  // Active state
  // =========================================

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
