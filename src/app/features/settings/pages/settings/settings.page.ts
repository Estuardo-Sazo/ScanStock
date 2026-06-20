import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  cashOutline,
  checkmarkCircle,
  ellipseOutline,
  informationCircleOutline,
  searchOutline,
  closeOutline,
  shieldCheckmarkOutline,
  globeOutline,
} from 'ionicons/icons';

import { CURRENCIES, Currency, SettingsService } from '../../../../core/services/settings.service';
import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, BottomNavbarComponent],
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  private settingsService = inject(SettingsService);

  searchQuery = signal('');

  get current() { return this.settingsService.currency(); }

  filteredCurrencies = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q),
    );
  });

  get regions(): string[] {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const c of this.filteredCurrencies()) {
      if (!seen.has(c.region)) { seen.add(c.region); list.push(c.region); }
    }
    return list;
  }

  currenciesByRegion(region: string): Currency[] {
    return this.filteredCurrencies().filter((c) => c.region === region);
  }

  isSelected(c: Currency) { return this.current.code === c.code; }

  selectCurrency(c: Currency) { this.settingsService.setCurrency(c); }

  clearSearch() { this.searchQuery.set(''); }

  readonly appVersion = '0.0.1';

  constructor() {
    addIcons({
      settingsOutline, cashOutline, checkmarkCircle, ellipseOutline,
      informationCircleOutline, searchOutline, closeOutline,
      shieldCheckmarkOutline, globeOutline,
    });
  }
}
