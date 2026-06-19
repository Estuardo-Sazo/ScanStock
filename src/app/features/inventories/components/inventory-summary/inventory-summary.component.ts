import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-summary',

  standalone: true,

  imports: [
    CommonModule,
  ],

  templateUrl: './inventory-summary.component.html',
})
export class InventorySummaryComponent {

  @Input()
  totalItems = 0;

  @Input()
  totalUnits = 0;
}