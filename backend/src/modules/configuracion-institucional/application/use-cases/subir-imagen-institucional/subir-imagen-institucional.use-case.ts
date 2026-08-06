import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { MinioStorageAdapter } from '../../../../storage/infrastructure/services/minio-storage.adapter';
import {
  IConfiguracionInstitucionalRepository,
  CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN,
} from '../../../domain/ports/configuracion-institucional.repository.interface';

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

@Injectable()
export class SubirImagenInstitucionalUseCase {
  constructor(
    @Inject(CONFIGURACION_INSTITUCIONAL_REPOSITORY_TOKEN)
    private readonly repo: IConfiguracionInstitucionalRepository,
    private readonly storage: MinioStorageAdapter,
  ) {}

  async execute(
    tipo: 'logo' | 'escudo',
    file: Express.Multer.File,
    usuarioId: string,
  ): Promise<{ storageKey: string }> {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Formato no permitido. Use PNG, JPEG, WEBP o SVG.');
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException('La imagen no puede superar 2 MB.');
    }

    const existing = await this.repo.findSingleton();
    if (!existing) throw new NotFoundException('Configuración institucional no encontrada');

    const ext = file.mimetype === 'image/svg+xml' ? 'svg' : file.mimetype.split('/')[1];
    const storageKey = `institucional/${tipo}.${ext}`;
    const hash = createHash('sha256').update(file.buffer).digest('hex');

    await this.storage.upload(this.storage.bucketDocs, storageKey, file.buffer, file.mimetype);
    await this.repo.updateImagen(tipo, storageKey, hash, usuarioId);

    return { storageKey };
  }

  async getSignedUrl(tipo: 'logo' | 'escudo'): Promise<string | null> {
    const config = await this.repo.findSingleton();
    if (!config) return null;

    const key = tipo === 'logo' ? config.logoStorageKey : config.escudoStorageKey;
    if (!key) return null;

    return this.storage.getSignedUrl(this.storage.bucketDocs, key, 300);
  }
}
