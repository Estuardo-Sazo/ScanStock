import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  cameraReverseOutline,
  scanOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { BarcodeScannerService } from '../../../../core/services/barcode-scanner.service';

@Component({
  selector: 'app-scanner-modal',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './scanner-modal.component.html',
  styleUrls: ['./scanner-modal.component.scss'],
})
export class ScannerModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  private modalController = inject(ModalController);
  private scannerService = inject(BarcodeScannerService);
  private ngZone = inject(NgZone);

  cameras = signal<MediaDeviceInfo[]>([]);
  currentIndex = signal(0);
  error = signal('');
  scanning = signal(false);
  scanned = false;

  get hasMultipleCameras() { return this.cameras().length > 1; }

  constructor() {
    addIcons({ closeOutline, cameraReverseOutline, scanOutline, alertCircleOutline });
  }

  async ngAfterViewInit() {
    // Small delay ensures the video element is in the DOM and modal animation finished
    setTimeout(() => this.initScanner(), 300);
  }

  async initScanner() {
    try {
      this.scanning.set(true);
      this.error.set('');

      await this.scannerService.startScan(
        this.videoRef.nativeElement,
        (barcode) => this.ngZone.run(() => this.onDetected(barcode)),
      );
    } catch (err: unknown) {
      this.ngZone.run(() => {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          this.error.set('Permiso de cámara denegado. Actívalo en ajustes del navegador.');
        } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
          this.error.set('No se encontró una cámara en este dispositivo.');
        } else {
          this.error.set('No se pudo acceder a la cámara.');
        }
        this.scanning.set(false);
      });
    }

    // After camera starts, enumerate cameras for the switch button
    try {
      const list = await this.scannerService.listCameras();
      this.cameras.set(list);
    } catch { /* ignore */ }
  }

  private onDetected(barcode: string) {
    if (this.scanned) return;
    this.scanned = true;
    this.playBeep();
    this.scannerService.stop();
    this.modalController.dismiss({ barcode }, 'confirm');
  }

  async switchCamera() {
    const list = this.cameras();
    if (list.length < 2) return;

    const next = (this.currentIndex() + 1) % list.length;
    this.currentIndex.set(next);

    try {
      await this.scannerService.startScanWithDevice(
        this.videoRef.nativeElement,
        list[next].deviceId,
        (barcode) => this.ngZone.run(() => this.onDetected(barcode)),
      );
    } catch {
      this.error.set('No se pudo cambiar la cámara.');
    }
  }

  close() {
    this.scannerService.stop();
    this.modalController.dismiss(null, 'cancel');
  }

  private playBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 1480;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch { /* ignore if audio not available */ }
  }

  ngOnDestroy() {
    this.scannerService.stop();
  }
}
