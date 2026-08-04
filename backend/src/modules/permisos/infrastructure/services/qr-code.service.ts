import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  private readonly salt: string;

  constructor(private readonly config: ConfigService) {
    this.salt = this.config.get<string>('qr.secretSalt') ?? 'pyp-default-salt';
  }

  /**
   * RN-05: codigoQr = SHA256(permisoId + ':' + SALT).
   * No contiene datos personales — solo identificador opaco.
   */
  generarCodigoOpaco(permisoId: string): string {
    return crypto.createHash('sha256').update(`${permisoId}:${this.salt}`).digest('hex');
  }

  /**
   * Genera imagen QR como Buffer PNG.
   * El contenido es la URL pública de verificación.
   */
  async generarImagenBuffer(url: string): Promise<Buffer> {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 200,
      color: { dark: '#000000', light: '#ffffff' },
    });
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    return Buffer.from(base64, 'base64');
  }
}
