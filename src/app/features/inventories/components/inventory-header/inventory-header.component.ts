import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Inventory } from '../../../../core/database/app-db';

@Component({
  selector: 'app-inventory-header',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './inventory-header.component.html',
})
export class InventoryHeaderComponent {
  @Input({ required: true })
  inventory!: Inventory;
}
