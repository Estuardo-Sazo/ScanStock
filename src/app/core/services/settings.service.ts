import { Injectable, signal } from '@angular/core';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  region: string;
}

export const CURRENCIES: Currency[] = [
  // Centroamérica
  { code: 'GTQ', symbol: 'Q',    name: 'Quetzal guatemalteco',  flag: '🇬🇹', region: 'Centroamérica' },
  { code: 'HNL', symbol: 'L',    name: 'Lempira hondureño',     flag: '🇭🇳', region: 'Centroamérica' },
  { code: 'NIO', symbol: 'C$',   name: 'Córdoba nicaragüense',  flag: '🇳🇮', region: 'Centroamérica' },
  { code: 'CRC', symbol: '₡',    name: 'Colón costarricense',   flag: '🇨🇷', region: 'Centroamérica' },
  { code: 'PAB', symbol: 'B/',   name: 'Balboa panameño',       flag: '🇵🇦', region: 'Centroamérica' },
  { code: 'BZD', symbol: 'BZ$',  name: 'Dólar de Belice',      flag: '🇧🇿', region: 'Centroamérica' },
  { code: 'SVC', symbol: '₡',    name: 'Colón salvadoreño',     flag: '🇸🇻', region: 'Centroamérica' },
  // Caribe
  { code: 'DOP', symbol: 'RD$',  name: 'Peso dominicano',       flag: '🇩🇴', region: 'Caribe' },
  { code: 'CUP', symbol: '$',    name: 'Peso cubano',           flag: '🇨🇺', region: 'Caribe' },
  { code: 'TTD', symbol: 'TT$',  name: 'Dólar de Trinidad',    flag: '🇹🇹', region: 'Caribe' },
  // América del Norte
  { code: 'USD', symbol: '$',    name: 'Dólar estadounidense',  flag: '🇺🇸', region: 'América del Norte' },
  { code: 'MXN', symbol: '$',    name: 'Peso mexicano',         flag: '🇲🇽', region: 'América del Norte' },
  { code: 'CAD', symbol: '$',    name: 'Dólar canadiense',      flag: '🇨🇦', region: 'América del Norte' },
  // América del Sur
  { code: 'COP', symbol: '$',    name: 'Peso colombiano',       flag: '🇨🇴', region: 'América del Sur' },
  { code: 'VES', symbol: 'Bs.',  name: 'Bolívar venezolano',   flag: '🇻🇪', region: 'América del Sur' },
  { code: 'PEN', symbol: 'S/',   name: 'Sol peruano',           flag: '🇵🇪', region: 'América del Sur' },
  { code: 'BRL', symbol: 'R$',   name: 'Real brasileño',        flag: '🇧🇷', region: 'América del Sur' },
  { code: 'ARS', symbol: '$',    name: 'Peso argentino',        flag: '🇦🇷', region: 'América del Sur' },
  { code: 'CLP', symbol: '$',    name: 'Peso chileno',          flag: '🇨🇱', region: 'América del Sur' },
  { code: 'BOB', symbol: 'Bs',   name: 'Boliviano',             flag: '🇧🇴', region: 'América del Sur' },
  { code: 'PYG', symbol: '₲',    name: 'Guaraní paraguayo',    flag: '🇵🇾', region: 'América del Sur' },
  { code: 'UYU', symbol: '$U',   name: 'Peso uruguayo',         flag: '🇺🇾', region: 'América del Sur' },
  { code: 'ECU', symbol: '$',    name: 'Dólar (Ecuador)',       flag: '🇪🇨', region: 'América del Sur' },
  // Europa
  { code: 'EUR', symbol: '€',    name: 'Euro',                  flag: '🇪🇺', region: 'Europa' },
  { code: 'GBP', symbol: '£',    name: 'Libra esterlina',       flag: '🇬🇧', region: 'Europa' },
  { code: 'CHF', symbol: 'Fr',   name: 'Franco suizo',          flag: '🇨🇭', region: 'Europa' },
  // Asia / Otros
  { code: 'JPY', symbol: '¥',    name: 'Yen japonés',           flag: '🇯🇵', region: 'Asia' },
  { code: 'CNY', symbol: '¥',    name: 'Yuan chino',            flag: '🇨🇳', region: 'Asia' },
  { code: 'INR', symbol: '₹',    name: 'Rupia india',           flag: '🇮🇳', region: 'Asia' },
  { code: 'KRW', symbol: '₩',    name: 'Won surcoreano',       flag: '🇰🇷', region: 'Asia' },
];

export interface AppSettings {
  currency: Currency;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: CURRENCIES[0], // GTQ por defecto
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly KEY = 'scanstock-settings';

  currency = signal<Currency>(DEFAULT_SETTINGS.currency);

  constructor() {
    this.load();
  }

  setCurrency(c: Currency) {
    this.currency.set(c);
    this.persist();
  }

  get currencySymbol() {
    return this.currency().symbol;
  }

  formatPrice(amount: number | undefined | null): string {
    if (amount == null) return '';
    const symbol = this.currency().symbol;
    return `${symbol}${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return;
      const data: AppSettings = JSON.parse(raw);
      const found = CURRENCIES.find((c) => c.code === data?.currency?.code);
      if (found) this.currency.set(found);
    } catch { /* ignore corrupt data */ }
  }

  private persist() {
    localStorage.setItem(this.KEY, JSON.stringify({ currency: this.currency() }));
  }
}
