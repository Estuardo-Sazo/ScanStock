import { Injectable } from '@angular/core';
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';

@Injectable({ providedIn: 'root' })
export class BarcodeScannerService {
  private reader: BrowserMultiFormatReader | null = null;

  private buildReader(): BrowserMultiFormatReader {
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
      BarcodeFormat.DATA_MATRIX,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    return new BrowserMultiFormatReader(hints, 500);
  }

  async startScan(
    videoEl: HTMLVideoElement,
    onResult: (barcode: string) => void,
  ): Promise<void> {
    this.stop();
    this.reader = this.buildReader();
    await this.reader.decodeFromConstraints(
      {
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      },
      videoEl,
      (result) => {
        if (result) onResult(result.getText());
      },
    );
  }

  async startScanWithDevice(
    videoEl: HTMLVideoElement,
    deviceId: string,
    onResult: (barcode: string) => void,
  ): Promise<void> {
    this.stop();
    this.reader = this.buildReader();
    await this.reader.decodeFromVideoDevice(deviceId, videoEl, (result) => {
      if (result) onResult(result.getText());
    });
  }

  async listCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'videoinput');
  }

  stop(): void {
    this.reader?.reset();
    this.reader = null;
  }
}
