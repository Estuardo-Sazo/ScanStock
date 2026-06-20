import { Component, Output, EventEmitter } from '@angular/core';
import { IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-floating-action-button',
  templateUrl: './floating-action-button.component.html',
  standalone: true,
  imports: [IonFab, IonFabButton, IonIcon],
})
export class FloatingActionButtonComponent {
  @Output() clickFab = new EventEmitter<void>();

  constructor() {
    addIcons({ addOutline });
  }

  onClick() {
    this.clickFab.emit();
  }
}
