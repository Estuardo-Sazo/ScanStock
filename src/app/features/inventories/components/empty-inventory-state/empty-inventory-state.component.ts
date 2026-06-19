import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cubeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-empty-inventory-state',

  standalone: true,

  imports: [CommonModule, IonIcon],

  templateUrl: './empty-inventory-state.component.html',
})
export class EmptyInventoryStateComponent {
  constructor() { addIcons({ cubeOutline }); }
}