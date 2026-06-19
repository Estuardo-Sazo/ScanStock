import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import { searchOutline, scanOutline, addCircleOutline } from 'ionicons/icons';
import { Product } from 'src/app/core/database/app-db';

@Component({
  selector: 'app-inventory-search-bar',

  standalone: true,

  imports: [CommonModule, FormsModule, IonIcon],

  templateUrl: './inventory-search-bar.component.html',
})
export class InventorySearchBarComponent {
  @Output()
  search = new EventEmitter<string>();

  @Output()
  scan = new EventEmitter<void>();

  query = '';

  constructor() {
    addIcons({
      searchOutline,
      scanOutline,
      addCircleOutline,
    });
  }

  onSearchChange() {
    this.search.emit(this.query);
  }

  openScanner() {
    this.scan.emit();
  }
}
